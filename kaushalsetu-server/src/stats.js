// Dashboard aggregates computed from REAL stored rows (PostgreSQL).
// Each metric reports `demo: true` when only seed rows exist, so the UI can
// label it "Demonstration data" instead of presenting it as live statistics.
import { all, get } from './db/pg.js';

async function stats(table, where = '', params = []) {
  const total = (await get(`SELECT COUNT(*)::INT c FROM ${table} ${where}`, params)).c;
  const real = (await get(`SELECT COUNT(*)::INT c FROM ${table} ${where ? where + ' AND' : 'WHERE'} is_demo = FALSE`, params)).c;
  return { total, real, demo: total > 0 && real === 0 };
}

const sum = async (table, col, where = '', params = []) =>
  (await get(`SELECT COALESCE(SUM(${col}),0)::INT s FROM ${table} ${where}`, params)).s;

function demoScope(user, idx = 1) {
  if (!user) return { clause: '', params: [] };
  if (String(user.id).startsWith('demo_') || user.provider === 'demo' || DEMO_ACCOUNT.test(user.email || '')) {
    return { clause: `AND (owner = $${idx} OR owner = 'seed')`, params: [user.id] };
  }
  return { clause: `AND owner NOT LIKE 'demo\\_%' ESCAPE '\\'`, params: [] };
}

export async function governmentStats(user) {
  const sc = demoScope(user);
  const sd = await stats('skill_demand', `WHERE 1=1 ${sc.clause}`, sc.params);
  const gaps = (await get(`SELECT COUNT(*)::INT c FROM skill_demand WHERE gap = 'High' ${sc.clause}`, sc.params)).c;
  const realGaps = (await get(`SELECT COUNT(*)::INT c FROM skill_demand WHERE gap = 'High' AND is_demo = FALSE AND owner NOT LIKE 'demo\\_%' ESCAPE '\\'`)).c;
  const centres = await stats('training_centres', `WHERE 1=1 ${sc.clause}`, sc.params);
  const demand = await stats('employer_demands', `WHERE 1=1 ${sc.clause}`, sc.params);
  const jobs = await stats('jobs', `WHERE 1=1 ${sc.clause}`, sc.params);
  const out = await get(`SELECT COALESCE(SUM(placed),0)::INT p, COALESCE(SUM(total),0)::INT t FROM employment_outcomes WHERE 1=1 ${sc.clause}`, sc.params);
  const realOut = await get(`SELECT COALESCE(SUM(placed),0)::INT p, COALESCE(SUM(total),0)::INT t FROM employment_outcomes WHERE is_demo = FALSE AND owner NOT LIKE 'demo\\_%' ESCAPE '\\'`);
  const anyReal = [sd, centres, demand, jobs].some((s) => s.real > 0) || realOut.t > 0;
  return {
    demo: !anyReal,
    skills: sd,
    criticalGaps: { total: gaps, real: realGaps, demo: gaps > 0 && realGaps === 0 },
    centres,
    employerDemand: { total: demand.total + jobs.total, real: demand.real + jobs.real, demo: (demand.total + jobs.total) > 0 && (demand.real + jobs.real) === 0 },
    placementRate: out.t ? Math.round((out.p / out.t) * 100) : 0,
    placementDemo: out.t > 0 && realOut.t === 0,
  };
}

function ownScope(userId, isDemo) {
  if (isDemo) return { clause: `owner IN ($1, 'seed')`, params: [userId] };
  return { clause: `owner = $1`, params: [userId] };
}

const DEMO_ACCOUNT = /^demo\.(govt|tc|emp|cand)@kaushalsetu\.in$/i;
const isDemo = (u) => u && (String(u.id || u).startsWith('demo_') || u.provider === 'demo' || DEMO_ACCOUNT.test(u.email || ''));

export async function trainingCentreStats(user) {
  const userId = typeof user === 'string' ? user : user.id;
  const sc = ownScope(userId, isDemo(user));
  const own = `WHERE ${sc.clause}`;
  const courses = await stats('courses', own, sc.params);
  const review = (await get(`SELECT COUNT(*)::INT c FROM courses ${own} AND status != 'Aligned'`, sc.params)).c;
  const batches = await all(`SELECT * FROM batches ${own}`, sc.params);
  const trainers = await all(`SELECT * FROM trainers ${own}`, sc.params);
  const enr = await stats('enrolments', own, sc.params);
  const plc = await stats('placements', own, sc.params);
  const seats = batches.reduce((a, b) => a + (b.seats || 0), 0);
  const enrolled = batches.reduce((a, b) => a + (b.enrolled || 0), 0);
  return {
    demo: [courses, enr].every((s) => s.demo) && courses.total + enr.total > 0,
    empty: courses.total + batches.length + trainers.length + enr.total + plc.total === 0,
    courses, needReview: review,
    seats, enrolled,
    trainers: trainers.length,
    lowScoreTrainers: trainers.filter((t) => (t.score || 0) < 60).length,
    enrolments: enr, placements: plc,
  };
}

export async function employerStats(user) {
  const userId = typeof user === 'string' ? user : user.id;
  const sc = ownScope(userId, isDemo(user));
  const jobs = await all(`SELECT * FROM jobs WHERE ${sc.clause}`, sc.params);
  const open = jobs.filter((j) => j.status === 'Open');
  return {
    demo: jobs.length > 0 && jobs.every((j) => j.is_demo),
    empty: jobs.length === 0,
    postings: jobs.length,
    openPositions: open.reduce((a, j) => a + (j.openings || 0), 0),
    openPostings: open.length,
  };
}

export async function candidateStats(user) {
  const userId = typeof user === 'string' ? user : user.id;
  const sc = ownScope(userId, isDemo(user));
  const own = `WHERE ${sc.clause}`;
  const skills = await all(`SELECT * FROM candidate_skills ${own}`, sc.params);
  const edu = await all(`SELECT * FROM education ${own}`, sc.params);
  const cert = await all(`SELECT * FROM certifications ${own}`, sc.params);
  const exp = await all(`SELECT * FROM experience ${own}`, sc.params);
  const apps = await all(`SELECT * FROM applications ${own}`, sc.params);
  const prof = await get('SELECT user_id FROM profiles WHERE user_id = $1', [userId]);
  return {
    empty: skills.length + edu.length + cert.length + exp.length === 0 && !prof,
    skills: skills.length, education: edu.length, certifications: cert.length,
    experience: exp.length, applications: apps.length,
    hasProfile: !!prof,
  };
}
