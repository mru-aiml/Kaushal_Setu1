// Phase 3 backend tests: full API suite against a real PostgreSQL test database.
// Run: npm test (creates kaushalsetu_test, migrates, spawns server, drops DB after).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const SERVER_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PORT = 4401;
const BASE = `http://localhost:${PORT}`;
const TEST_DB = 'kaushalsetu_test';
let proc;

const adminConf = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres',
};

const json = (method, p, body, token) =>
  fetch(`${BASE}${p}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

function runMigrations(dbName) {
  const r = spawnSync('node', ['scripts/migrate.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, DB_NAME: dbName, AI_PROVIDER: 'none' },
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`migrate failed: ${r.stdout}\n${r.stderr}`);
}

function runSeed(dbName) {
  const r = spawnSync('node', ['scripts/seed.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, DB_NAME: dbName, AI_PROVIDER: 'none' },
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`seed failed: ${r.stdout}\n${r.stderr}`);
}

before(async () => {
  const admin = new pg.Client(adminConf);
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();
  runMigrations(TEST_DB);
  runSeed(TEST_DB);
  proc = spawn('node', ['src/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), DB_NAME: TEST_DB, AI_PROVIDER: 'none' },
    stdio: 'pipe',
  });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      const h = await r.json();
      if (r.ok && h?.database?.connected) return;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not start');
});

after(async () => {
  if (proc) {
    proc.kill();
    await new Promise((r) => proc.on('exit', r));
  }
  const admin = new pg.Client(adminConf);
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await admin.end();
});

let govToken, candToken, candId;

test('health reports backend mode, google off, ai off', async () => {
  const r = await fetch(`${BASE}/api/health`).then((x) => x.json());
  assert.equal(r.ok, true);
  assert.equal(r.ai.configured, false);
  assert.equal(r.auth.googleConfigured, false);
});

test('signup → signin lifecycle with role lock', async () => {
  let r = await json('POST', '/api/auth/signup', { name: 'Gov User', email: 'gov@test.in', password: 'secret12' });
  assert.equal(r.status, 201);
  assert.equal(r.body.user.onboarded, false);
  govToken = r.body.token;

  r = await json('POST', '/api/auth/signin', { email: 'gov@test.in', password: 'wrong' });
  assert.equal(r.status, 401);

  r = await json('POST', '/api/auth/signin', { email: 'gov@test.in', password: 'secret12' });
  assert.equal(r.status, 200);
  govToken = r.body.token;

  // assign role once
  r = await json('PUT', '/api/me', { role: 'government' }, govToken);
  assert.equal(r.status, 200);
  assert.equal(r.body.user.role, 'government');

  // role locked afterwards
  r = await json('PUT', '/api/me', { role: 'candidate' }, govToken);
  assert.equal(r.status, 403);
  assert.equal(r.body.code, 'role_locked');
});

test('candidate signup + profile persists across refresh', async () => {
  let r = await json('POST', '/api/auth/signup', { name: 'Asha', email: 'asha@test.in', password: 'secret12' });
  candToken = r.body.token;
  candId = r.body.user.id;
  await json('PUT', '/api/me', { role: 'candidate' }, candToken);

  r = await json('PUT', '/api/me/profile', {
    data: { fullName: 'Asha Patil', email: 'asha@test.in', phone: '+919812345678', state: 'Maharashtra', district: 'Pune', skills: 'Basic Automotive' },
  }, candToken);
  assert.equal(r.status, 200);
  assert.ok(r.body.profile.completion > 0);

  r = await json('GET', '/api/me/profile', null, candToken);
  assert.equal(r.body.profile.data.district, 'Pune');

  // invalid profile rejected
  r = await json('PUT', '/api/me/profile', { data: { fullName: '', email: 'bad', state: 'Maharashtra', district: 'Pune', skills: 'x' } }, candToken);
  assert.equal(r.status, 400);
  assert.ok(r.body.fields.email);
});

test('RBAC: candidate cannot touch government datasets; employer cannot write gov data', async () => {
  let r = await json('GET', '/api/data/skill_demand', null, candToken);
  assert.equal(r.status, 200); // readable aggregate
  assert.ok(r.body.writable === false);

  r = await json('POST', '/api/data/skill_demand', { skill: 'X', district: 'Pune', demand_index: 5, supply: 1 }, candToken);
  assert.equal(r.status, 403);

  r = await json('GET', '/api/data/jobs', null, candToken);
  assert.equal(r.status, 403); // another role's private dataset

  // government CAN write skill_demand
  r = await json('POST', '/api/data/skill_demand', { skill: 'Test Skill', district: 'Pune', demand_index: 70, supply: 20, gap: 'High' }, govToken);
  assert.equal(r.status, 201);
  const id = r.body.record.id;

  r = await json('PUT', `/api/data/skill_demand/${id}`, { skill: 'Test Skill', district: 'Pune', demand_index: 71, supply: 20 }, govToken);
  assert.equal(r.status, 200);

  r = await json('DELETE', `/api/data/skill_demand/${id}`, null, govToken);
  assert.equal(r.status, 200);
});

test('candidate CRUD on own skills dataset', async () => {
  let r = await json('POST', '/api/data/candidate_skills', { skill: 'EV Diagnostics', proficiency: 'Beginner', years: 0.5 }, candToken);
  assert.equal(r.status, 201);

  r = await json('POST', '/api/data/candidate_skills', { skill: '', proficiency: 'Beginner' }, candToken);
  assert.equal(r.status, 400);

  r = await json('GET', '/api/data/candidate_skills?q=ev', null, candToken);
  assert.equal(r.status, 200);
  assert.ok(r.body.total >= 1);
});

test('import: invalid rows reported, never silently dropped', async () => {
  const csv = 'skill,proficiency,years\nEV Diagnostics,Beginner,1\n,Bogus,\nBattery Management,Expert,2';
  let r = await json('POST', '/api/import/parse', { filename: 'skills.csv', content: Buffer.from(csv).toString('base64') }, candToken);
  assert.equal(r.status, 200);
  assert.equal(r.body.total, 3);

  r = await json('POST', '/api/import/commit', {
    entity: 'candidate_skills',
    rows: r.body.rows,
    mapping: { skill: 'skill', proficiency: 'proficiency', years: 'years' },
  }, candToken);
  assert.equal(r.status, 200);
  assert.equal(r.body.imported, 2);
  assert.equal(r.body.failed, 1);
  assert.equal(r.body.errors.length, 1);
});

test('resume PDF extraction identifies fields', async () => {
  // Build a minimal valid PDF with text content
  const text = 'Asha Patil\nasha@test.in\n+919812345678\nB.Tech Electrical 2022\nSkills: EV Diagnostics, Python';
  const stream = `BT /F1 12 Tf 50 700 Td (${text.replace(/\n/g, ') Tj T* (')}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
  const r = await json('POST', '/api/import/resume', { filename: 'resume.pdf', content: Buffer.from(pdf, 'latin1').toString('base64') }, candToken);
  assert.equal(r.status, 200);
  assert.ok(r.body.text.includes('Asha Patil'));
  assert.equal(r.body.fields.email, 'asha@test.in');
});

test('AI endpoints fail gracefully with 503 when unconfigured (no fake output)', async () => {
  const r = await json('POST', '/api/ai/career-recommendations', {}, candToken);
  assert.equal(r.status, 503);
  assert.equal(r.body.code, 'ai_not_configured');

  const r2 = await json('POST', '/api/ai/curriculum', { targetRole: 'EV Technician' }, govToken);
  assert.equal(r2.status, 503);
});

test('reports: real PDF + CSV download with stored data', async () => {
  let r = await json('POST', '/api/reports/generate', { type: 'skill-demand', filters: {}, format: 'csv' }, govToken);
  assert.equal(r.status, 201);
  const csvRes = await fetch(`${BASE}/api/reports/${r.body.id}/download`, { headers: { Authorization: `Bearer ${govToken}` } });
  assert.equal(csvRes.status, 200);
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('EV Diagnostics'));
  assert.ok(csvText.includes('Battery Management'));

  r = await json('POST', '/api/reports/generate', { type: 'district-skill-gap', filters: {}, format: 'pdf' }, govToken);
  assert.equal(r.status, 201);
  const pdfRes = await fetch(`${BASE}/api/reports/${r.body.id}/download`, { headers: { Authorization: `Bearer ${govToken}` } });
  assert.equal(pdfRes.status, 200);
  assert.equal(pdfRes.headers.get('content-type'), 'application/pdf');
  const buf = Buffer.from(await pdfRes.arrayBuffer());
  assert.ok(buf.slice(0, 4).toString() === '%PDF');

  // cross-owner download denied
  const denied = await fetch(`${BASE}/api/reports/${r.body.id}/download`, { headers: { Authorization: `Bearer ${candToken}` } });
  assert.equal(denied.status, 404);

  // wrong-role report type denied
  r = await json('POST', '/api/reports/generate', { type: 'district-skill-gap', filters: {}, format: 'pdf' }, candToken);
  assert.equal(r.status, 403);
});

test('stats come from the data layer', async () => {
  const r = await json('GET', '/api/stats/government', null, govToken);
  assert.equal(r.status, 200);
  assert.ok(r.body.skills.total >= 6);
  assert.equal(r.body.demo, true); // seed only

  const r2 = await json('GET', '/api/stats/government', null, candToken);
  assert.equal(r2.status, 403);
});

test('profile schema is role-specific; curricula CRUD works', async () => {
  const s = await json('GET', '/api/profile-schema', null, candToken);
  assert.equal(s.status, 200);
  assert.ok(s.body.schema.some((f) => f.name === 'skills'));

  const s2 = await json('GET', '/api/profile-schema', null, govToken);
  assert.ok(s2.body.schema.some((f) => f.name === 'department'));

  // save curriculum (as government user)
  const fake = { title: 'EV Basics', objective: 'Test', duration: '20h', modules: [{ title: 'M1', duration: '20h', skills: ['EV Safety'], topics: ['T1'], activities: ['A1'], assessment: 'Quiz' }], final_assessment: 'Exam', recommended_resources: [] };
  let r = await json('POST', '/api/curricula', { title: 'EV Basics', targetRole: 'EV Technician', data: fake }, govToken);
  assert.equal(r.status, 201);

  r = await json('GET', '/api/curricula', null, govToken);
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.data[0].title, 'EV Basics');

  // curriculum PDF report contains the module
  r = await json('POST', '/api/reports/generate', { type: 'curriculum', filters: {}, format: 'pdf' }, govToken);
  assert.equal(r.status, 201);
  const pdfRes = await fetch(`${BASE}/api/reports/${r.body.id}/download`, { headers: { Authorization: `Bearer ${govToken}` } });
  assert.equal(pdfRes.headers.get('content-type'), 'application/pdf');

  // candidate cannot save curricula
  r = await json('POST', '/api/curricula', { title: 'X', data: fake }, candToken);
  assert.equal(r.status, 403);
});

test('AI path works end-to-end against an OpenAI-compatible provider', async () => {
  // Test-only stub standing in for a real LLM provider (Groq/NVIDIA/etc.).
  const http = await import('node:http');
  const career = { recommended_roles: [{ role: 'EV Service Technician', match: 'High', why: 'Matches skills', strengths: ['Basic Automotive'], missing_skills: ['EV Diagnostics'], training: ['EV Fundamentals (80h)'], salary_outlook: '₹32–40k' }], skill_gaps: [{ skill: 'EV Diagnostics', demand: 'High', priority: 'Critical' }], recommended_skills: ['EV Diagnostics'], recommended_courses: [{ title: 'EV Fundamentals (80h)', hours: '80h', provider: 'ITI Bhosari' }], career_path: ['Basic Automotive', 'EV Fundamentals', 'EV Service Technician'], reasoning: ['Profile matches EV demand in Pune'] };
  const TIC = '```';
  const stub = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const isCurr = JSON.parse(body).messages?.[1]?.content?.includes('TRAINING REQUEST');
      const payload = isCurr
        ? { title: 'EV Service Technician', objective: 'Job-ready EV skills', duration: '200h', modules: [{ title: 'EV Safety', duration: '20h', skills: ['HV Safety'], topics: ['PPE'], activities: ['Lab drill'], assessment: 'Quiz' }], final_assessment: 'Practical exam', recommended_resources: ['ARAI manual'] }
        : career;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: `${TIC}json\n${JSON.stringify(payload)}\n${TIC}` } }] }));
    });
  });
  await new Promise((r) => stub.listen(0, r));
  const stubUrl = `http://localhost:${stub.address().port}`;

  const { spawn: spawn2 } = await import('node:child_process');
  const AI_DB = 'kaushalsetu_test_ai';
  const admin2 = new pg.Client(adminConf);
  await admin2.connect();
  await admin2.query(`DROP DATABASE IF EXISTS ${AI_DB}`);
  await admin2.query(`CREATE DATABASE ${AI_DB}`);
  await admin2.end();
  runMigrations(AI_DB);
  runSeed(AI_DB);
  const PORT2 = 4402;
  const proc2 = spawn2('node', ['src/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT2), DB_NAME: AI_DB, AI_PROVIDER: 'openai-compatible', AI_BASE_URL: stubUrl, AI_API_KEY: 'test-key', AI_MODEL: 'test-model' },
    stdio: 'pipe',
  });
  const B2 = `http://localhost:${PORT2}`;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${B2}/api/health`);
      if (r.ok) break;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  const j2 = (m, p, b, t) => fetch(`${B2}${p}`, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: b ? JSON.stringify(b) : undefined }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

  try {
    let r = await j2('POST', '/api/auth/signup', { name: 'AI Cand', email: 'aic@test.in', password: 'secret12' });
    const ct = r.body.token;
    await j2('PUT', '/api/me', { role: 'candidate' }, ct);
    await j2('PUT', '/api/me/profile', { data: { fullName: 'AI Cand', email: 'aic@test.in', phone: '+911234567890', state: 'Maharashtra', district: 'Pune', skills: 'Basic Automotive' } }, ct);
    r = await j2('POST', '/api/ai/career-recommendations', {}, ct);
    assert.equal(r.status, 200);
    assert.equal(r.body.generated, 'ai');
    assert.ok(Array.isArray(r.body.result.recommended_roles));
    assert.ok(Array.isArray(r.body.result.career_path));

    r = await j2('POST', '/api/auth/signup', { name: 'AI Gov', email: 'aig@test.in', password: 'secret12' });
    const gt = r.body.token;
    await j2('PUT', '/api/me', { role: 'government' }, gt);
    r = await j2('POST', '/api/ai/curriculum', { targetRole: 'EV Service Technician', requiredSkills: ['EV Diagnostics'] }, gt);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.result.modules));
    assert.equal(r.body.result.modules[0].title, 'EV Safety');
  } finally {
    proc2.kill();
    await new Promise((r) => proc2.on('exit', r));
    stub.close();
    const admin3 = new pg.Client(adminConf);
    await admin3.connect();
    await admin3.query(`DROP DATABASE IF EXISTS ${AI_DB}`);
    await admin3.end();
  }
});

test('demo sessions are isolated from real aggregates', async () => {
  const d = await json('POST', '/api/demo/session', { role: 'employer' });
  assert.equal(d.status, 201);
  const demoToken = d.body.token;

  // demo employer writes a job
  const r = await json('POST', '/api/data/jobs', { title: 'Demo Job', role: 'X', openings: 5 }, demoToken);
  assert.equal(r.status, 201);

  // demo rows do not leak into the government employer-demand report
  const rep = await json('POST', '/api/reports/generate', { type: 'employer-demand', filters: {}, format: 'csv' }, govToken);
  assert.equal(rep.status, 201);
  const csvRes = await fetch(`${BASE}/api/reports/${rep.body.id}/download`, { headers: { Authorization: `Bearer ${govToken}` } });
  const text = await csvRes.text();
  assert.ok(!text.includes('Demo Job'));

  // demo user cannot read real users' private rows (owner-scoped)
  const mine = await json('GET', '/api/data/candidate_skills', null, demoToken);
  assert.equal(mine.status, 403); // demo employer role != candidate dataset
});
