// Report catalog + generation. Reports query REAL stored rows and produce
// REAL downloadable files (PDF via built-in writer, CSV, XLSX via xlsx lib).
// "Demonstration data" is stamped only when every row used is a seed row.
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import { all, get, run } from './db/pg.js';
import { now, uid } from './util.js';
import { config } from './config.js';
import { buildPdf } from './pdf.js';

export const REPORT_CATALOG = {
  government: [
    { type: 'district-skill-gap', title: 'District Skill Gap Report' },
    { type: 'skill-demand', title: 'Skill Demand Report' },
    { type: 'training-capacity', title: 'Training Capacity Report' },
    { type: 'employer-demand', title: 'Employer Demand Report' },
    { type: 'employment-outcomes', title: 'Employment Outcome Report' },
    { type: 'programme-impact', title: 'Programme Impact Report' },
    { type: 'curriculum', title: 'Curriculum Report' },
  ],
  trainingCentre: [
    { type: 'tc-capacity', title: 'Training Capacity Report' },
    { type: 'tc-courses', title: 'Course Report' },
    { type: 'tc-enrolments', title: 'Enrolment Report' },
    { type: 'tc-completion', title: 'Completion Report' },
    { type: 'tc-placements', title: 'Placement / Outcome Report' },
    { type: 'curriculum', title: 'Curriculum Report' },
  ],
  employer: [
    { type: 'em-hiring', title: 'Hiring Demand Report' },
    { type: 'em-skills', title: 'Skill Requirement Report' },
    { type: 'em-open', title: 'Open Positions Report' },
  ],
  candidate: [
    { type: 'ca-profile', title: 'Skills Profile' },
    { type: 'ca-gap', title: 'Skill Gap Report' },
    { type: 'ca-career', title: 'Career Recommendation Report' },
    { type: 'ca-training', title: 'Training Recommendation Report' },
  ],
};

const ALLOWED = {};
for (const [role, list] of Object.entries(REPORT_CATALOG)) {
  for (const r of list) {
    ALLOWED[r.type] = ALLOWED[r.type] || [];
    if (!ALLOWED[r.type].includes(role)) ALLOWED[r.type].push(role);
  }
}

export function reportRoles(type) {
  return ALLOWED[type] || [];
}

// Demo-owned rows never leak into shared aggregates: real users see seed +
// real rows; demo users (sessions + documented demo accounts) see seed +
// their own rows only.
const DEMO_ACCOUNT = /^demo\.(govt|tc|emp|cand)@kaushalsetu\.in$/i;
const isDemoUser = (u) => String(u.id).startsWith('demo_') || u.provider === 'demo' || DEMO_ACCOUNT.test(u.email || '');
function visClause(user) {
  if (isDemoUser(user)) {
    return { clause: ` AND (owner = ? OR owner = 'seed')`, params: [user.id] };
  }
  return { clause: ` AND owner NOT LIKE 'demo\\_%' ESCAPE '\\'`, params: [] };
}

// Convert SQLite-style ? placeholders to Postgres $n positional params.
function pq(where, params) {
  let i = 0;
  return { text: String(where).replace(/\?/g, () => `$${++i}`), params };
}

async function rows(table, where = '', params = []) {
  const q = pq(where, params);
  return all(`SELECT * FROM ${table} ${q.text}`, q.params);
}

function csvOf(head, dataRows) {
  const q = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [head.map(q).join(','), ...dataRows.map((r) => r.map(q).join(','))].join('\n') + '\n';
}

async function getProfileRow(userId) {
  const row = await get('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  if (!row) return null;
  return { ...row, data: typeof row.data === 'string' ? JSON.parse(row.data || '{}') : (row.data || {}) };
}

// Owner scope for private datasets: demo sessions see seed + own rows,
// real users see only their own rows.
function ownScope(user) {
  if (isDemoUser(user)) {
    return { clause: `owner IN (?, 'seed')`, params: [user.id] };
  }
  return { clause: `owner = ?`, params: [user.id] };
}

// Build { head, rows, summary[], tables? } from REAL stored data.
async function buildDataset(type, user, filters = {}) {
  const f = (v) => (v === undefined || v === null || v === '' ? null : String(v));
  const district = f(filters.district);
  const like = (col, v) => (v ? { clause: ` AND ${col} LIKE ?`, param: `%${v}%` } : { clause: '', param: null });
  const d = like('district', district);

  switch (type) {
    case 'district-skill-gap': {
      const v = visClause(user);
      const r = await rows('skill_demand', `WHERE 1=1${v.clause}${d.clause}`, [...v.params, ...(d.param ? [d.param] : [])]);
      return {
        head: ['Skill', 'Sector', 'District', 'State', 'Demand Index', 'Supply', 'Gap', 'Trend'],
        rows: r.map((x) => [x.skill, x.sector, x.district, x.state, x.demand_index, x.supply, x.gap, x.trend]),
        summary: [`${r.length} skill-demand records analysed`, `Average demand index: ${r.length ? Math.round(r.reduce((a, x) => a + (x.demand_index || 0), 0) / r.length) : 0}`],
        demo: r.length > 0 && r.every((x) => x.is_demo),
        empty: r.length === 0,
      };
    }
    case 'skill-demand': {
      const s = f(filters.sector);
      const sc = s ? { clause: ' AND sector LIKE ?', param: `%${s}%` } : { clause: '', param: null };
      const v = visClause(user);
      const r = await rows('skill_demand', `WHERE 1=1${v.clause}${d.clause}${sc.clause}`, [...v.params, d.param, sc.param].filter(Boolean));
      return {
        head: ['Skill', 'Sector', 'District', 'Demand Index', 'Supply', 'Gap', 'Trend', 'Source'],
        rows: r.map((x) => [x.skill, x.sector, x.district, x.demand_index, x.supply, x.gap, x.trend, x.source || '']),
        summary: [`${r.length} records`, `Total indexed demand: ${r.reduce((a, x) => a + (x.demand_index || 0), 0)}`],
        demo: r.length > 0 && r.every((x) => x.is_demo),
        empty: r.length === 0,
      };
    }
    case 'training-capacity': {
      const v = visClause(user);
      const c = await rows('training_centres', `WHERE 1=1${v.clause}`, v.params);
      const co = await rows('courses', `WHERE 1=1${v.clause}`, v.params);
      return {
        head: ['Centre', 'Centre ID', 'District', 'Capacity (seats)', 'Accreditation'],
        rows: c.map((x) => [x.name, x.centre_id, x.district, x.capacity, x.accreditation]),
        summary: [`${c.length} centres · ${co.length} courses`, `Combined capacity: ${c.reduce((a, x) => a + (x.capacity || 0), 0)} seats`],
        demo: [...c, ...co].length > 0 && [...c, ...co].every((x) => x.is_demo),
        empty: c.length === 0 && co.length === 0,
      };
    }
    case 'employer-demand': {
      const v = visClause(user);
      const r = await rows('employer_demands', `WHERE 1=1${v.clause}${d.clause}`, [...v.params, ...(d.param ? [d.param] : [])]);
      const j = await rows('jobs', `WHERE 1=1${v.clause}`, v.params);
      return {
        head: ['Company', 'Role', 'Skills', 'Openings', 'Location', 'Status'],
        rows: [...r.map((x) => [x.company, x.role, x.skills, x.openings, x.location, x.status]),
          ...j.map((x) => [`(posting) ${x.title}`, x.role, x.skills, x.openings, x.location, x.status])],
        summary: [`${r.length + j.length} demand records`, `Total openings: ${[...r, ...j].reduce((a, x) => a + (x.openings || 0), 0)}`],
        demo: [...r, ...j].length > 0 && [...r, ...j].every((x) => x.is_demo),
        empty: r.length === 0 && j.length === 0,
      };
    }
    case 'employment-outcomes': {
      const v = visClause(user);
      const r = await rows('employment_outcomes', `WHERE 1=1${v.clause}${d.clause}`, [...v.params, ...(d.param ? [d.param] : [])]);
      const placed = r.reduce((a, x) => a + (x.placed || 0), 0);
      const total = r.reduce((a, x) => a + (x.total || 0), 0);
      return {
        head: ['District', 'Trade', 'Placed', 'Total', 'Placement %', 'Year'],
        rows: r.map((x) => [x.district, x.trade, x.placed, x.total, x.total ? Math.round((x.placed / x.total) * 100) + '%' : '—', x.year]),
        summary: [`${r.length} outcome records`, `Overall placement rate: ${total ? Math.round((placed / total) * 100) + '%' : '—'} (${placed}/${total})`],
        demo: r.length > 0 && r.every((x) => x.is_demo),
        empty: r.length === 0,
      };
    }
    case 'programme-impact': {
      const v = visClause(user);
      const r = await rows('programmes', `WHERE 1=1${v.clause}`, v.params);
      return {
        head: ['Programme', 'Sector', 'Seats', 'Status', 'Start Year'],
        rows: r.map((x) => [x.name, x.sector, x.seats, x.status, x.start_year]),
        summary: [`${r.length} programmes`, `Total seats: ${r.reduce((a, x) => a + (x.seats || 0), 0)}`],
        demo: r.length > 0 && r.every((x) => x.is_demo),
        empty: r.length === 0,
      };
    }
    case 'tc-capacity':
    case 'tc-courses':
    case 'tc-enrolments':
    case 'tc-completion':
    case 'tc-placements': {
      const sc = ownScope(user);
      const own = `WHERE ${sc.clause}`;
      const courses = await rows('courses', own, sc.params);
      const batches = await rows('batches', own, sc.params);
      const enr = await rows('enrolments', own, sc.params);
      const plc = await rows('placements', own, sc.params);
      const seats = batches.reduce((a, b) => a + (b.seats || 0), 0);
      const enrolled = batches.reduce((a, b) => a + (b.enrolled || 0), 0);
      const map = {
        'tc-capacity': { head: ['Batch', 'Course', 'Seats', 'Enrolled', 'Start', 'Status'], rows: batches.map((b) => [b.batch_code, b.course, b.seats, b.enrolled, b.start_date, b.status]), summary: [`${batches.length} batches`, `Utilisation: ${seats ? Math.round((enrolled / seats) * 100) + '%' : '—'} (${enrolled}/${seats})`] },
        'tc-courses': { head: ['Course', 'Code', 'Sector', 'Hours', 'Alignment %', 'Status'], rows: courses.map((c) => [c.title, c.code, c.sector, c.duration_hours, c.alignment, c.status]), summary: [`${courses.length} courses`] },
        'tc-enrolments': { head: ['Student', 'Course', 'Batch', 'Status', 'Enrolled On'], rows: enr.map((e) => [e.student, e.course, e.batch_code, e.status, e.enrolled_on]), summary: [`${enr.length} enrolments`] },
        'tc-completion': { head: ['Student', 'Course', 'Batch', 'Status'], rows: enr.map((e) => [e.student, e.course, e.batch_code, e.status]), summary: [`Completed: ${enr.filter((e) => e.status === 'Completed').length}/${enr.length}`] },
        'tc-placements': { head: ['Student', 'Course', 'Employer', 'Salary', 'Placed On'], rows: plc.map((p) => [p.student, p.course, p.employer, p.salary, p.placed_on]), summary: [`${plc.length} placements`] },
      };
      const ds = map[type];
      const all = [...courses, ...batches, ...enr, ...plc];
      return { ...ds, demo: all.length > 0 && all.every((x) => x.is_demo), empty: ds.rows.length === 0 };
    }
    case 'em-hiring':
    case 'em-skills':
    case 'em-open': {
      const sc = ownScope(user);
      const j = await rows('jobs', `WHERE ${sc.clause}`, sc.params);
      const open = j.filter((x) => x.status === 'Open');
      const map = {
        'em-hiring': { head: ['Title', 'Role', 'Location', 'Openings', 'Status'], rows: j.map((x) => [x.title, x.role, x.location, x.openings, x.status]), summary: [`${j.length} postings · ${open.reduce((a, x) => a + (x.openings || 0), 0)} open positions`] },
        'em-skills': { head: ['Title', 'Required Skills', 'Experience'], rows: j.map((x) => [x.title, x.skills, x.experience]), summary: [`${j.length} postings`] },
        'em-open': { head: ['Title', 'Role', 'Location', 'Salary Range', 'Openings'], rows: open.map((x) => [x.title, x.role, x.location, `${x.salary_min || '—'}–${x.salary_max || '—'}`, x.openings]), summary: [`${open.length} open postings`] },
      };
      return { ...map[type], demo: j.length > 0 && j.every((x) => x.is_demo), empty: map[type].rows.length === 0 };
    }
    case 'ca-profile':
    case 'ca-gap':
    case 'ca-career':
    case 'ca-training': {
      const prof = await getProfileRow(user.id);
      const pdata = prof ? prof.data : {};
      const sc = ownScope(user);
      const skills = await rows('candidate_skills', `WHERE ${sc.clause}`, sc.params);
      const edu = await rows('education', `WHERE ${sc.clause}`, sc.params);
      const cert = await rows('certifications', `WHERE ${sc.clause}`, sc.params);
      const demand = await rows('skill_demand', '');
      if (type === 'ca-profile') {
        return {
          head: ['Field', 'Value'],
          rows: Object.entries(pdata).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v ?? '')]),
          summary: [`Profile completion: ${prof ? 'saved' : 'not started'}`, `${skills.length} skills · ${edu.length} education records · ${cert.length} certifications`],
          demo: false, empty: Object.keys(pdata).length === 0,
        };
      }
      if (type === 'ca-gap') {
        const have = new Set(skills.map((s) => s.skill.toLowerCase()));
        const gaps = demand.filter((x) => ![...have].some((h) => x.skill.toLowerCase().includes(h) || h.includes(x.skill.toLowerCase().split(' ')[0])));
        return {
          head: ['In-Demand Skill', 'Demand Index', 'Your Status', 'Priority'],
          rows: gaps.slice(0, 20).map((x) => [x.skill, x.demand_index, 'Missing', x.gap === 'High' ? 'Critical' : 'High']),
          summary: [`${gaps.length} gaps vs ${skills.length} current skills`],
          demo: demand.length > 0 && demand.every((x) => x.is_demo) && skills.length === 0,
          empty: demand.length === 0,
        };
      }
      const recs = await rows('career_recommendations', 'WHERE owner = ? ORDER BY created_at DESC LIMIT 1', [user.id]);
      const last = recs[0] ? (typeof recs[0].result === 'string' ? JSON.parse(recs[0].result) : recs[0].result) : null;
      if (type === 'ca-career') {
        const roles = last?.recommended_roles || [];
        return {
          head: ['Recommended Role', 'Match', 'Why'],
          rows: roles.map((r) => [r.role, r.match, r.why]),
          summary: last ? ['AI-generated recommendation (latest saved)'] : ['No AI recommendation generated yet — use Career Navigator → Generate AI Recommendation'],
          demo: false, empty: roles.length === 0,
        };
      }
      const courses = last?.recommended_courses || [];
      return {
        head: ['Course', 'Hours', 'Provider'],
        rows: courses.map((c) => [c.title, c.hours, c.provider]),
        summary: last ? ['AI-generated training list (latest saved)'] : ['No AI recommendation generated yet'],
        demo: false, empty: courses.length === 0,
      };
    }
    case 'curriculum': {
      const list = await rows('curricula', 'WHERE owner = ?', [user.id]);
      const wanted = f(filters.curriculumId);
      const cur = wanted ? list.find((c) => c.id === wanted) : list[0];
      if (!cur) {
        return { head: [], rows: [], summary: ['No saved curriculum yet — generate and save one first.'], demo: false, empty: true };
      }
      let d = (cur.data && typeof cur.data === 'object') ? cur.data : {};
      if (typeof cur.data === 'string') { try { d = JSON.parse(cur.data); } catch { d = {}; } }
      const mods = Array.isArray(d.modules) ? d.modules : [];
      return {
        head: ['Module', 'Duration', 'Skills', 'Topics', 'Activities', 'Assessment'],
        rows: mods.map((m) => [m.title, m.duration, (m.skills || []).join(', '), (m.topics || []).join(', '), (m.activities || []).join(', '), m.assessment]),
        summary: [`Title: ${cur.title}`, `Objective: ${d.objective || '—'}`, `Duration: ${cur.duration || d.duration || '—'}`, `Modules: ${mods.length}`, `Final assessment: ${d.final_assessment || '—'}`, `Resources: ${(d.recommended_resources || []).join(', ') || '—'}`],
        demo: false,
        empty: mods.length === 0,
      };
    }
    default:
      throw Object.assign(new Error('Unknown report type'), { status: 400 });
  }
}

export async function generateReport(user, type, filters = {}, format = 'pdf') {
  const allowedRoles = reportRoles(type);
  if (!allowedRoles.length) throw Object.assign(new Error('Unknown report type'), { status: 400 });
  if (!allowedRoles.includes(user.role)) throw Object.assign(new Error('Access restricted for this report type'), { status: 403 });
  if (!['pdf', 'csv', 'xlsx'].includes(format)) throw Object.assign(new Error('Format must be pdf, csv or xlsx'), { status: 400 });

  const catalog = REPORT_CATALOG[user.role].find((r) => r.type === type);
  const ds = await buildDataset(type, user, filters);
  if (ds.empty) {
    const err = new Error('No data is available for the selected filters.');
    err.status = 404;
    err.code = 'empty_report';
    throw err;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const id = uid('rep');
  const safe = type.replace(/[^a-z0-9]+/gi, '-');
  const filename = `${safe}-${stamp}.${format}`;
  const filePath = path.join(config.dataDir, 'reports', `${id}.${format}`);

  const filterLine = Object.entries(filters).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ') || 'none';
  const meta = [
    ['Generated', new Date().toLocaleString()],
    ['Generated by', `${user.name} (${user.role})`],
    ['Filters', filterLine],
    ['Data source', ds.demo ? 'Demonstration data (illustrative seed)' : 'Platform records'],
  ];

  if (format === 'pdf') {
    const buf = buildPdf({
      title: catalog.title,
      subtitle: 'KaushalSetu · Labour-Market Intelligence & Curriculum Alignment Platform',
      meta,
      sections: [
        { heading: 'Summary', bullets: ds.summary },
        ...(ds.demo ? [{ paragraph: 'Note: this report is built from demonstration data (illustrative seed). Add real records to regenerate with live data.' }] : []),
        { heading: `Records (${ds.rows.length})`, table: { head: ds.head, rows: ds.rows.map((r) => r.map((c) => String(c ?? ''))), widths: ds.head.map(() => 1) } },
      ],
    });
    fs.writeFileSync(filePath, buf);
  } else if (format === 'csv') {
    const lines = [
      `# ${catalog.title} — KaushalSetu`,
      ...meta.map(([k, v]) => `# ${k}: ${v}`),
      ...ds.summary.map((s) => `# ${s}`),
    ];
    fs.writeFileSync(filePath, lines.join('\n') + '\n' + csvOf(ds.head, ds.rows));
  } else {
    const wb = XLSX.utils.book_new();
    const metaRows = [['KaushalSetu — ' + catalog.title], [], ...meta.map(([k, v]) => [k, v]), [], ['Summary'], ...ds.summary.map((s) => [s]), []];
    const ws = XLSX.utils.aoa_to_sheet([...metaRows, ds.head, ...ds.rows.map((r) => r.map((c) => c ?? ''))]);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filePath);
  }

  const size = fs.statSync(filePath).size;
  await run(`INSERT INTO reports (id, owner, role, type, title, filters, format, filename, size, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, user.id, user.role, type, catalog.title, JSON.stringify(filters), format, filename, size, now()]);
  return { id, title: catalog.title, format, filename, size, rows: ds.rows.length, demo: ds.demo };
}

export async function getReport(id) {
  return (await get('SELECT * FROM reports WHERE id = $1', [id])) || null;
}

export function reportPath(id, format) {
  return path.join(config.dataDir, 'reports', `${id}.${format}`);
}

const MIME = { pdf: 'application/pdf', csv: 'text/csv', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
export function mimeFor(format) {
  return MIME[format] || 'application/octet-stream';
}

