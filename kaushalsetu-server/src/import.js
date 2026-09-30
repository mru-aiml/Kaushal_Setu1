// Import pipeline: parse (CSV/XLSX) → preview → validate → commit.
// Resume PDFs: text extraction (backend) + rules-based field identification.
import XLSX from 'xlsx';
import zlib from 'node:zlib';
import { validateRow } from './entities.js';

export function extOf(filename = '') {
  const m = String(filename).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

// RFC-4180 style CSV parser (handles quotes, escaped quotes, newlines in fields).
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = String(text).replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  row.push(field);
  rows.push(row);
  // drop trailing empty row
  while (rows.length && rows[rows.length - 1].every((c) => c === '')) rows.pop();
  if (!rows.length) return { columns: [], rows: [] };
  const columns = rows[0].map((c) => c.trim());
  const data = rows.slice(1).map((r) => {
    const o = {};
    columns.forEach((col, i) => { o[col] = (r[i] ?? '').trim(); });
    return o;
  });
  return { columns, rows: data };
}

export function parseFile(filename, buffer) {
  const ext = extOf(filename);
  if (ext === 'csv') {
    return parseCSV(buffer.toString('utf8'));
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) return { columns: [], rows: [] };
    const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!aoa.length) return { columns: [], rows: [] };
    const columns = aoa[0].map((c) => String(c).trim());
    const rows = aoa.slice(1)
      .filter((r) => r.some((c) => String(c).trim() !== ''))
      .map((r) => {
        const o = {};
        columns.forEach((col, i) => { o[col] = String(r[i] ?? '').trim(); });
        return o;
      });
    return { columns, rows };
  }
  throw new Error(`Unsupported file type ".${ext}". Upload CSV or XLSX.`);
}

// Apply a column mapping {fileColumn -> entityField}, validate every row.
// Returns { valid: [...cleanRows], invalid: [{index, row, errors}] }.
// Invalid rows are NEVER silently discarded — they are returned with reasons.
export function validateImport(entity, fileRows, mapping) {
  const valid = [];
  const invalid = [];
  fileRows.forEach((fr, i) => {
    const mapped = {};
    for (const [fileCol, field] of Object.entries(mapping || {})) {
      if (field) mapped[field] = fr[fileCol];
    }
    const { clean, errors } = validateRow(entity, mapped);
    if (errors.length) invalid.push({ index: i + 2, row: fr, errors }); // +2 = header + 1-based
    else valid.push(clean);
  });
  return { valid, invalid, total: fileRows.length };
}

// ---------- Resume PDF extraction ----------

function extractPdfText(buffer) {
  // Best-effort text extraction: inflate FlateDecode streams, scan Tj/TJ ops.
  const parts = [];
  const latin = buffer.toString('latin1');
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m;
  const streams = [];
  while ((m = streamRe.exec(latin)) !== null) streams.push(m[1]);
  // Also try the whole file as raw (uncompressed PDFs)
  const candidates = [...streams.map((s) => Buffer.from(s, 'latin1')), buffer];
  for (const cand of candidates) {
    let data = null;
    try {
      // Heuristic: try inflate; if it fails, treat as raw text carrier.
      data = zlib.inflateSync(cand).toString('latin1');
    } catch {
      data = cand.toString('latin1');
    }
    // Tj and TJ array ops
    const tjRe = /\((?:\\.|[^\\()])*\)\s*Tj/g;
    let t;
    while ((t = tjRe.exec(data)) !== null) {
      parts.push(t[0].slice(1, t[0].lastIndexOf(')'))
        .replace(/\\n/g, '\n').replace(/\\r/g, '\n').replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\'));
    }
    const tjaRe = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ/g;
    while ((t = tjaRe.exec(data)) !== null) {
      const inner = t[1];
      const strRe = /\((?:\\.|[^\\()])*\)/g;
      let s2;
      let chunk = '';
      while ((s2 = strRe.exec(inner)) !== null) {
        chunk += s2[0].slice(1, -1).replace(/\\n/g, '\n').replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\') + ' ';
      }
      if (chunk.trim()) parts.push(chunk);
    }
  }
  return parts.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const SKILL_DICT = [
  'EV Diagnostics', 'Battery Management', 'BMS', 'CAN Protocol', 'HV Safety',
  'Electrical Systems', 'Vehicle Diagnostics', 'Python', 'SQL', 'Excel',
  'PLC', 'SCADA', 'CNC', 'Mastercam', 'Welding', 'Solar PV', 'Cold Chain',
  'Inventory', 'Driving', 'Communication', 'Customer Handling', 'Tally',
  'MS Office', 'AutoCAD', 'GD&T', 'Robotics', 'MLOps', 'Docker', 'Git',
];

export function extractResume(buffer) {
  const text = extractPdfText(buffer);
  if (!text || text.length < 50) {
    return { text, fields: {}, confidence: 'low', note: 'Could not extract readable text from this PDF. It may be scanned — text will be stored as-is.' };
  }
  const fields = {};
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) fields.email = email[0];
  const phone = text.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/);
  if (phone) fields.phone = phone[0].trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length) fields.fullName = lines[0].slice(0, 120);
  const edu = text.match(/(10th|12th|ITI|Diploma|B\.?E\.?|B\.?Tech|M\.?Tech|MBA|BCA|MCA|B\.?Sc|M\.?Sc|Graduation|Bachelor|Master)[^,\n]{0,80}/i);
  if (edu) fields.education = edu[0].trim().slice(0, 200);
  const year = text.match(/(19|20)\d{2}/g);
  if (year) fields.graduationYear = year[year.length - 1];
  const lower = text.toLowerCase();
  fields.skills = SKILL_DICT.filter((s) => lower.includes(s.toLowerCase())).slice(0, 20).join(', ');
  const expYears = text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)(?:\s*(?:of\s*)?(?:experience|exp))?/i);
  if (expYears) fields.experience = expYears[0].slice(0, 300);
  const cert = text.match(/(certif[^,\n]{0,80}|NSQF[^,\n]{0,40}|ITI[^,\n]{0,40})/i);
  if (cert) fields.certifications = cert[0].trim().slice(0, 300);
  return {
    text: text.slice(0, 20000),
    fields,
    confidence: Object.keys(fields).length >= 3 ? 'medium' : 'low',
    note: 'Rules-based extraction on the backend (keyword + pattern matching). Review before saving.',
  };
}
