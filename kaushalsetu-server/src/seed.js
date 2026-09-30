// Seed demonstration dataset (flagged is_demo=1). Real user rows use is_demo=0.
// Dashboards label metrics "Demonstration data" until real rows exist.
import { db, now, uid } from './db.js';

function count(table) {
  return db.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c;
}

function insert(table, row, demo = true) {
  const cols = Object.keys(row);
  const placeholders = cols.map((c) => `@${c}`).join(', ');
  db.prepare(`INSERT INTO ${table} (id, owner, ${cols.join(', ')}, is_demo, created_at)
    VALUES (@id, @owner, ${placeholders}, @is_demo, @created_at)`).run({
    id: uid('seed'), owner: 'seed', ...row, is_demo: demo ? 1 : 0, created_at: now(),
  });
}

export function seed() {
  if (count('skill_demand') > 0) return; // seed once

  const skills = [
    ['EV Battery Diagnostics & BMS', 'Electric Vehicles', 'Pune', 'Maharashtra', 94, 23, 'High', '+42%'],
    ['HV Safety & Power Systems', 'Electric Vehicles', 'Nashik', 'Maharashtra', 81, 29, 'High', '+35%'],
    ['AI/ML Model Deployment (MLOps)', 'IT & AI/ML', 'Bengaluru Urban', 'Karnataka', 91, 34, 'Medium', '+38%'],
    ['Solar PV Installation & O&M', 'Renewable Energy', 'Ahmedabad', 'Gujarat', 86, 48, 'Medium', '+31%'],
    ['CNC 5-Axis Programming', 'Precision Manufacturing', 'Coimbatore', 'Tamil Nadu', 83, 39, 'Medium', '+27%'],
    ['Green Hydrogen Plant Ops', 'Green Hydrogen', 'Jamnagar', 'Gujarat', 74, 12, 'High', '+51%'],
  ];
  for (const [skill, sector, district, state, demand_index, supply, gap, trend] of skills) {
    insert('skill_demand', { skill, sector, district, state, demand_index, supply, gap, trend, source: 'Seed scenario' });
  }

  const districts = [
    ['Pune', 'Maharashtra', 'Skill gap %', 71, 2026],
    ['Pune', 'Maharashtra', 'Annual training supply', 18200, 2026],
    ['Nashik', 'Maharashtra', 'Skill gap %', 66, 2026],
    ['Coimbatore', 'Tamil Nadu', 'Skill gap %', 58, 2026],
  ];
  for (const [district, state, metric, value, year] of districts) {
    insert('district_stats', { district, state, metric, value, year });
  }

  insert('training_centres', { name: 'Pune Skill Development Centre', centre_id: 'PSD-001', state: 'Maharashtra', district: 'Pune', domains: 'Automotive / EV, Manufacturing', capacity: 420, accreditation: 'NSQF aligned' });
  insert('programmes', { name: 'EV Service Technician Programme', sector: 'Automotive / EV', seats: 1200, status: 'Active', start_year: 2026 });
  insert('employment_outcomes', { district: 'Pune', trade: 'EV Technician', placed: 186, total: 240, year: 2025 });

  const courses = [
    ['EV Technician', 'EVT-101', 'Automotive / EV', 200, 'NSQF L4', 54, 'Needs Update'],
    ['Automotive Technician', 'AUT-102', 'Automotive', 180, 'NSQF L4', 82, 'Aligned'],
    ['CNC Programming', 'CNC-103', 'Manufacturing', 160, 'NSQF L4', 76, 'Review'],
  ];
  for (const [title, code, sector, duration_hours, level, alignment, status] of courses) {
    insert('courses', { title, code, sector, duration_hours, level, alignment, status });
  }
  insert('batches', { course: 'EV Technician', batch_code: 'EVT-2026-A', seats: 60, enrolled: 48, start_date: '2026-04-01', status: 'Running' });
  const trainers = [
    ['S. Deshmukh', 'Auto / EV', 'HV L3 · ARAI', 82, 'Active'],
    ['R. Nair', 'Mechatronics', 'Siemens PLC', 74, 'Active'],
    ['P. Yadav', 'Electrician', '—', 48, 'Upskilling'],
  ];
  for (const [name, trade, certification, score, status] of trainers) {
    insert('trainers', { name, trade, certification, score, status });
  }
  insert('jobs', { title: 'EV Battery Technician', role: 'EV Service Technician', industry: 'Automotive / EV', skills: 'BMS, HV Safety, CAN diagnostics', experience: '0–2 yrs', location: 'Pune', salary_min: 18000, salary_max: 32000, openings: 120, status: 'Open' });
  insert('jobs', { title: 'PLC Automation Engineer', role: 'Automation Engineer', industry: 'Manufacturing', skills: 'Siemens PLC, SCADA, Robotics', experience: '1–3 yrs', location: 'Coimbatore', salary_min: 25000, salary_max: 45000, openings: 65, status: 'Open' });
}
