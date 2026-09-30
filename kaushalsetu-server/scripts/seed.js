// Full interconnected demonstration dataset (Goal 2).
// Maharashtra geography; shared skills/occupations/courses/employers across roles.
// All rows: owner='seed', is_demo=TRUE. Idempotent (skips when seed present,
// --force to reseed). Real-user aggregates exclude NOTHING here — seed rows are
// labeled "Demonstration data" by the API whenever no live rows exist.
// Usage: npm run db:seed [-- --force]
import { pool, closePool } from '../src/db/pg.js';
import { hashPassword } from '../src/auth.js';

const now = () => new Date().toISOString();
let seq = 0;
const uid = (p = 'seed') => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function insert(table, row) {
  const cols = Object.keys(row);
  await pool.query(
    `INSERT INTO ${table} (id, owner, ${cols.join(', ')}, is_demo, created_at) VALUES ($1, 'seed', ${cols.map((_, i) => `$${i + 2}`).join(', ')}, TRUE, $${cols.length + 2})`,
    [uid(), ...Object.values(row), now()]
  );
}

const DISTRICTS = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Navi Mumbai', 'Thane', 'Satara', 'Ahilyanagar'];

async function seedSkills() {
  const rows = [
    ['EV Diagnostics', 'Automotive / EV', 'Pune', 94, 23, 'High', '+42%'],
    ['Battery Management', 'Automotive / EV', 'Pune', 91, 31, 'High', '+38%'],
    ['CAN Protocol', 'Automotive / EV', 'Pune', 84, 27, 'High', '+33%'],
    ['EV Safety', 'Automotive / EV', 'Nashik', 81, 29, 'High', '+35%'],
    ['CNC Programming', 'Manufacturing', 'Kolhapur', 83, 39, 'Medium', '+27%'],
    ['CNC 5-Axis', 'Manufacturing', 'Pune', 79, 22, 'High', '+29%'],
    ['PLC Programming', 'Industrial Automation', 'Chhatrapati Sambhajinagar', 77, 33, 'Medium', '+24%'],
    ['Industrial Automation', 'Industrial Automation', 'Nashik', 75, 30, 'Medium', '+22%'],
    ['AutoCAD', 'Manufacturing', 'Thane', 68, 52, 'Low', '+9%'],
    ['Electrical Maintenance', 'Manufacturing', 'Nagpur', 72, 44, 'Medium', '+14%'],
    ['Solar O&M', 'Renewable Energy', 'Satara', 86, 41, 'Medium', '+31%'],
    ['Solar PV Installation', 'Renewable Energy', 'Ahilyanagar', 82, 47, 'Medium', '+28%'],
    ['Data Analysis', 'IT', 'Mumbai', 88, 55, 'Medium', '+26%'],
    ['Python', 'IT', 'Navi Mumbai', 90, 58, 'Medium', '+30%'],
    ['SQL', 'IT', 'Mumbai', 87, 60, 'Low', '+21%'],
    ['Machine Learning', 'IT', 'Pune', 89, 34, 'High', '+36%'],
    ['Power BI', 'IT', 'Thane', 76, 49, 'Medium', '+19%'],
    ['React', 'IT', 'Navi Mumbai', 81, 53, 'Medium', '+23%'],
    ['Node.js', 'IT', 'Mumbai', 78, 50, 'Medium', '+20%'],
    ['Cloud Computing', 'IT', 'Pune', 85, 42, 'Medium', '+27%'],
    ['Cybersecurity', 'IT', 'Mumbai', 83, 36, 'High', '+32%'],
    ['Welding', 'Construction', 'Nagpur', 66, 51, 'Low', '+8%'],
    ['Quality Control', 'Manufacturing', 'Kolhapur', 71, 46, 'Medium', '+12%'],
    ['Cold Chain Logistics', 'Logistics', 'Navi Mumbai', 74, 38, 'Medium', '+18%'],
  ];
  for (const [skill, sector, district, demand_index, supply, gap, trend] of rows) {
    await insert('skill_demand', { skill, sector, district, state: 'Maharashtra', demand_index, supply, gap, trend, source: 'Demonstration dataset' });
  }
  const gaps = [['Pune', 71], ['Mumbai', 48], ['Nashik', 66], ['Nagpur', 52], ['Chhatrapati Sambhajinagar', 58], ['Kolhapur', 44], ['Navi Mumbai', 39], ['Thane', 41], ['Satara', 55], ['Ahilyanagar', 61]];
  const supplies = [18200, 26400, 8400, 9200, 7800, 6100, 5400, 7200, 4300, 3900];
  const ready = [58, 66, 59, 63, 61, 70, 72, 69, 64, 60];
  for (let i = 0; i < DISTRICTS.length; i++) {
    await insert('district_stats', { district: DISTRICTS[i], state: 'Maharashtra', metric: 'Skill gap %', value: gaps[i][1], year: 2026 });
    await insert('district_stats', { district: DISTRICTS[i], state: 'Maharashtra', metric: 'Annual training supply', value: supplies[i], year: 2026 });
    await insert('district_stats', { district: DISTRICTS[i], state: 'Maharashtra', metric: 'Readiness score', value: ready[i], year: 2026 });
  }
}

async function seedEmployers() {
  const employers = [
    ['Tata Motors', 'Automotive / EV'], ['Mahindra & Mahindra', 'Automotive / EV'], ['Bosch India', 'Industrial Automation'],
    ['Bajaj Auto', 'Automotive'], ['Tata Power Solar', 'Renewable Energy'], ['Infosys', 'IT'],
    ['Tata Consultancy Services', 'IT'], ['Siemens India', 'Industrial Automation'], ['Larsen & Toubro', 'Construction'],
    ['Apollo Hospitals', 'Healthcare'], ['Deccan EV Works (demo)', 'Automotive / EV'], ['Sahyadri Solar Systems (demo)', 'Renewable Energy'],
    ['Godavari Logistics (demo)', 'Logistics'], ['Maratha Electronics (demo)', 'Electronics'],
  ];
  const jobs = [
    ['EV Service Technician', 'EV Service Technician', 'Automotive / EV', 'EV Diagnostics, Battery Management, CAN Protocol', '0–2 yrs', 'Pune', 22000, 38000, 120, 'Tata Motors'],
    ['Battery Technician', 'Battery Technician', 'Automotive / EV', 'Battery Management, EV Safety', '0–1 yrs', 'Pune', 18000, 30000, 80, 'Deccan EV Works (demo)'],
    ['CNC Programmer', 'CNC Programmer', 'Manufacturing', 'CNC Programming, CNC 5-Axis, AutoCAD', '1–3 yrs', 'Kolhapur', 25000, 45000, 45, 'Bosch India'],
    ['PLC Automation Engineer', 'PLC Automation Engineer', 'Industrial Automation', 'PLC Programming, Industrial Automation', '1–3 yrs', 'Chhatrapati Sambhajinagar', 30000, 55000, 35, 'Siemens India'],
    ['Solar O&M Technician', 'Solar O&M Technician', 'Renewable Energy', 'Solar O&M, Solar PV Installation, Electrical Maintenance', '0–2 yrs', 'Satara', 18000, 32000, 60, 'Tata Power Solar'],
    ['Data Analyst', 'Data Analyst', 'IT', 'Data Analysis, SQL, Power BI', '0–2 yrs', 'Mumbai', 35000, 60000, 90, 'Infosys'],
    ['MLOps Associate', 'MLOps Associate', 'IT', 'Machine Learning, Python, Cloud Computing', '1–2 yrs', 'Pune', 50000, 90000, 40, 'Tata Consultancy Services'],
    ['Cold Chain Logistics Executive', 'Cold Chain Logistics Executive', 'Logistics', 'Cold Chain Logistics, Inventory', '0–2 yrs', 'Navi Mumbai', 22000, 38000, 30, 'Godavari Logistics (demo)'],
    ['Industrial Electrician', 'Industrial Electrician', 'Manufacturing', 'Electrical Maintenance, PLC Programming', '1–4 yrs', 'Nagpur', 20000, 36000, 50, 'Mahindra & Mahindra'],
    ['Full Stack Developer', 'Full Stack Developer', 'IT', 'React, Node.js, SQL', '1–3 yrs', 'Navi Mumbai', 45000, 85000, 55, 'Infosys'],
    ['Quality Technician', 'Quality Technician', 'Manufacturing', 'Quality Control, AutoCAD', '0–2 yrs', 'Thane', 20000, 34000, 40, 'Maratha Electronics (demo)'],
    ['Maintenance Engineer', 'Maintenance Engineer', 'Manufacturing', 'Electrical Maintenance, Welding', '2–5 yrs', 'Nashik', 30000, 52000, 25, 'Bajaj Auto'],
    ['Solar PV Installer', 'Solar PV Installer', 'Renewable Energy', 'Solar PV Installation, Electrical Maintenance', '0–1 yrs', 'Ahilyanagar', 16000, 28000, 70, 'Sahyadri Solar Systems (demo)'],
    ['Site Supervisor', 'Site Supervisor', 'Construction', 'Welding, Quality Control', '2–4 yrs', 'Thane', 28000, 48000, 20, 'Larsen & Toubro'],
    ['Healthcare Logistics Assistant', 'Healthcare Logistics Assistant', 'Healthcare', 'Cold Chain Logistics, Inventory', '0–1 yrs', 'Mumbai', 18000, 30000, 25, 'Apollo Hospitals'],
    ['Embedded Technician', 'Embedded Technician', 'Electronics', 'CAN Protocol, Electrical Maintenance', '0–2 yrs', 'Pune', 24000, 42000, 30, 'Maratha Electronics (demo)'],
  ];
  for (const [title, role, industry, skills, experience, location, smin, smax, openings, company] of jobs) {
    await insert('jobs', { title, role, industry, skills, experience, location, salary_min: smin, salary_max: smax, openings, status: 'Open' });
    await insert('employer_demands', { company, role, skills, openings, location, status: 'Open' });
  }
  void employers;
}

async function seedCentres() {
  const centres = [
    ['Pune Skill Development Centre', 'PSD-001', 'Pune', 'Automotive / EV, Manufacturing', 420, 'NSQF aligned'],
    ['Nashik Advanced Manufacturing Centre', 'NSK-002', 'Nashik', 'Manufacturing, Industrial Automation', 320, 'NSQF aligned'],
    ['Nagpur Digital Skills Centre', 'NAG-003', 'Nagpur', 'IT, Logistics', 280, 'NSQF aligned'],
    ['Mumbai Industry Skills Hub', 'MUM-004', 'Mumbai', 'IT, Healthcare', 500, 'NSQF aligned'],
    ['Chhatrapati Sambhajinagar Technical Centre', 'CSN-005', 'Chhatrapati Sambhajinagar', 'Manufacturing, Automation', 260, 'Affiliated'],
    ['Kolhapur Engineering Skills Centre', 'KOL-006', 'Kolhapur', 'Manufacturing', 220, 'Affiliated'],
    ['Thane Construction & Trades Centre', 'TNE-007', 'Thane', 'Construction, Electrical', 200, 'Affiliated'],
    ['Satara Renewable Energy Centre', 'SAT-008', 'Satara', 'Renewable Energy', 180, 'NSQF aligned'],
  ];
  for (const [name, centre_id, district, domains, capacity, accreditation] of centres) {
    await insert('training_centres', { name, centre_id, state: 'Maharashtra', district, domains, capacity, accreditation });
  }
  const courses = [
    ['EV Technician Fundamentals', 'EVT-101', 'Automotive / EV', 200, 'NSQF L4', 54, 'Needs Update'],
    ['Advanced EV Diagnostics', 'EVT-201', 'Automotive / EV', 120, 'NSQF L5', 48, 'Needs Update'],
    ['Battery Management Systems', 'EVT-202', 'Automotive / EV', 120, 'NSQF L4', 61, 'Review'],
    ['CNC Programming', 'MFG-101', 'Manufacturing', 160, 'NSQF L4', 76, 'Review'],
    ['CNC 5-Axis Operations', 'MFG-201', 'Manufacturing', 140, 'NSQF L5', 58, 'Needs Update'],
    ['PLC & Industrial Automation', 'AUT-101', 'Industrial Automation', 180, 'NSQF L4', 72, 'Review'],
    ['Industrial Electrical Maintenance', 'ELE-101', 'Manufacturing', 160, 'NSQF L4', 79, 'Aligned'],
    ['Solar PV Installation', 'SOL-101', 'Renewable Energy', 100, 'NSQF L4', 84, 'Aligned'],
    ['Solar O&M', 'SOL-201', 'Renewable Energy', 80, 'NSQF L4', 77, 'Review'],
    ['Data Analytics with Python', 'IT-101', 'IT', 140, 'NSQF L5', 81, 'Aligned'],
    ['Machine Learning Foundations', 'IT-201', 'IT', 160, 'NSQF L6', 69, 'Review'],
    ['Full Stack Development', 'IT-102', 'IT', 200, 'NSQF L5', 83, 'Aligned'],
    ['Cloud Fundamentals', 'IT-103', 'IT', 100, 'NSQF L5', 78, 'Aligned'],
    ['Cybersecurity Fundamentals', 'IT-104', 'IT', 120, 'NSQF L5', 66, 'Review'],
    ['Power BI & Business Intelligence', 'IT-105', 'IT', 80, 'NSQF L4', 80, 'Aligned'],
    ['Industrial Quality Control', 'MFG-102', 'Manufacturing', 90, 'NSQF L4', 74, 'Review'],
    ['Welding & Fabrication', 'CON-101', 'Construction', 120, 'NSQF L3', 71, 'Aligned'],
    ['Cold Chain Logistics', 'LOG-101', 'Logistics', 80, 'NSQF L4', 68, 'Review'],
  ];
  for (const [title, code, sector, duration_hours, level, alignment, status] of courses) {
    await insert('courses', { title, code, sector, duration_hours, level, alignment, status });
  }
  const batches = [
    ['EV Technician Fundamentals', 'EVT-2026-A', 60, 52, '2026-04-01', 'Running'],
    ['EV Technician Fundamentals', 'EVT-2026-B', 60, 35, '2026-07-01', 'Running'],
    ['Battery Management Systems', 'BMS-2026-A', 40, 38, '2026-05-01', 'Running'],
    ['CNC Programming', 'CNC-2026-A', 40, 31, '2026-03-01', 'Running'],
    ['Data Analytics with Python', 'DA-2026-A', 50, 50, '2026-02-01', 'Completed'],
    ['Solar PV Installation', 'SOL-2026-A', 45, 40, '2026-06-01', 'Running'],
    ['PLC & Industrial Automation', 'PLC-2025-B', 36, 36, '2025-11-01', 'Completed'],
    ['Full Stack Development', 'FS-2026-A', 48, 44, '2026-05-15', 'Running'],
    ['Welding & Fabrication', 'WLD-2025-A', 30, 28, '2025-10-01', 'Completed'],
    ['Cold Chain Logistics', 'CCL-2026-A', 32, 20, '2026-08-01', 'Planned'],
  ];
  for (const [course, batch_code, seats, enrolled, start_date, status] of batches) {
    await insert('batches', { course, batch_code, seats, enrolled, start_date, status });
  }
  const trainers = [
    ['S. Deshmukh', 'Auto / EV', 'HV L3 · ARAI', 82, 'Active'],
    ['R. Nair', 'Mechatronics', 'Siemens PLC', 74, 'Active'],
    ['P. Yadav', 'Electrician', 'ITI Instructor', 48, 'Upskilling'],
    ['K. Subramani', 'Fitter / CNC', 'Mastercam', 66, 'Active'],
    ['A. Sheikh', 'COPA / IT', 'NIELIT', 39, 'Upskilling'],
    ['M. Rao', 'Healthcare', 'HMIS · GDP', 71, 'Active'],
    ['V. Patil', 'Solar', 'NSEFI PV', 78, 'Active'],
    ['J. Ekka', 'Welding', 'ITI Instructor', 52, 'Upskilling'],
    ['N. Kulkarni', 'EV Diagnostics', 'ARAI EV L2', 80, 'Active'],
    ['D. Shinde', 'Battery Systems', 'Tata Power certified', 76, 'Active'],
    ['F. Khan', 'Data Analytics', 'Microsoft DA', 84, 'Active'],
    ['G. Iyer', 'Full Stack', 'AWS Certified', 81, 'Active'],
    ['H. Joshi', 'Cloud', 'AWS Solutions Architect', 79, 'Active'],
    ['L. Pawar', 'Quality Control', 'Six Sigma GB', 73, 'Active'],
    ['O. Bansode', 'PLC / SCADA', 'Siemens S7', 77, 'Active'],
    ['R. Chavan', 'Solar O&M', 'MNRE SPV', 70, 'Active'],
    ['S. Mane', 'CNC 5-Axis', 'DMG Mori', 68, 'Active'],
    ['T. Gaikwad', 'Logistics', 'GDP Cold Chain', 65, 'Active'],
  ];
  for (const [name, trade, certification, score, status] of trainers) {
    await insert('trainers', { name, trade, certification, score, status });
  }
  const programmes = [
    ['EV Service Technician Programme', 'Automotive / EV', 1200, 'Active', 2026],
    ['Advanced Manufacturing Mission', 'Manufacturing', 900, 'Active', 2026],
    ['Digital Skills for Youth', 'IT', 2000, 'Active', 2025],
    ['Surya Mitra Solar Programme', 'Renewable Energy', 1100, 'Active', 2025],
  ];
  for (const [name, sector, seats, status, start_year] of programmes) {
    await insert('programmes', { name, sector, seats, status, start_year });
  }
}

const CANDIDATES = [
  ['Aarav Sharma', 'Pune', 'ITI', 'Electrician', 2023, 'Basic Automotive, Two-wheeler repair', 'Beginner', 'EV Service Technician', 'Automotive / EV', 'employed'],
  ['Priya Deshmukh', 'Pune', 'Diploma', 'Electrical Engineering', 2022, 'Basic electricals, Solar PV Installation', 'Intermediate', 'Solar O&M Technician', 'Renewable Energy', 'employed'],
  ['Rohan Patil', 'Nashik', 'ITI', 'Fitter', 2021, 'Manual lathe, Welding', 'Intermediate', 'CNC Programmer', 'Manufacturing', 'seeking'],
  ['Sneha Kulkarni', 'Mumbai', 'UG', 'B.Sc Computer Science', 2023, 'Python, SQL, Excel', 'Intermediate', 'Data Analyst', 'IT', 'employed'],
  ['Amit Yadav', 'Nagpur', '12th', 'Higher Secondary', 2022, 'Inventory, Driving', 'Beginner', 'Cold Chain Logistics Executive', 'Logistics', 'in-training'],
  ['Pooja Mane', 'Kolhapur', 'ITI', 'COPA', 2023, 'MS Office, Tally', 'Beginner', 'Data Analyst', 'IT', 'seeking'],
  ['Vikram Singh', 'Chhatrapati Sambhajinagar', 'Diploma', 'Mechanical Engineering', 2020, 'CNC Programming, AutoCAD', 'Advanced', 'CNC Programmer', 'Manufacturing', 'employed'],
  ['Neha Joshi', 'Pune', 'UG', 'B.E. Electrical', 2022, 'Electrical Maintenance, PLC Programming', 'Intermediate', 'PLC Automation Engineer', 'Industrial Automation', 'employed'],
  ['Suresh Pawar', 'Satara', 'ITI', 'Wireman', 2019, 'House wiring, Electrical Maintenance', 'Advanced', 'Solar O&M Technician', 'Renewable Energy', 'self-employed'],
  ['Kavita Shinde', 'Thane', '12th', 'Higher Secondary', 2023, 'Customer Handling, MS Office', 'Beginner', 'Healthcare Logistics Assistant', 'Healthcare', 'seeking'],
  ['Rahul Chavan', 'Ahilyanagar', 'ITI', 'Solar Technician', 2022, 'Solar PV Installation', 'Intermediate', 'Solar O&M Technician', 'Renewable Energy', 'apprentice'],
  ['Divya Nair', 'Navi Mumbai', 'PG', 'MCA', 2021, 'React, Node.js, SQL', 'Advanced', 'Full Stack Developer', 'IT', 'employed'],
  ['Kiran Jadhav', 'Pune', 'Diploma', 'Automobile Engineering', 2023, 'Basic Automotive, EV Safety', 'Intermediate', 'EV Service Technician', 'Automotive / EV', 'in-training'],
  ['Meera Iyer', 'Mumbai', 'UG', 'B.Com', 2022, 'Tally, Power BI, Excel', 'Intermediate', 'Data Analyst', 'IT', 'seeking'],
  ['Anil Rathod', 'Nashik', 'ITI', 'Welder', 2018, 'Welding, Quality Control', 'Advanced', 'Maintenance Engineer', 'Manufacturing', 'employed'],
  ['Sunita Gaikwad', 'Satara', '10th', 'Secondary', 2021, 'House wiring', 'Beginner', 'Solar PV Installer', 'Renewable Energy', 'in-training'],
  ['Farhan Sheikh', 'Pune', 'UG', 'BCA', 2023, 'Python, Git', 'Beginner', 'MLOps Associate', 'IT', 'unemployed'],
  ['Lata Bansode', 'Kolhapur', 'Diploma', 'Electronics', 2022, 'CAN Protocol, Electrical Maintenance', 'Intermediate', 'Embedded Technician', 'Electronics', 'employed'],
  ['Manoj Tiwari', 'Nagpur', 'ITI', 'Electrician', 2020, 'Electrical Maintenance, Driving', 'Intermediate', 'Industrial Electrician', 'Manufacturing', 'seeking'],
  ['Geeta More', 'Thane', '12th', 'Higher Secondary', 2023, 'Inventory, Customer Handling', 'Beginner', 'Quality Technician', 'Manufacturing', 'apprentice'],
  ['Sandeep More', 'Pune', 'UG', 'B.E. Mechanical', 2021, 'AutoCAD, CNC Programming', 'Advanced', 'Maintenance Engineer', 'Manufacturing', 'employed'],
  ['Ritu Verma', 'Mumbai', 'PG', 'M.Sc Data Science', 2022, 'Machine Learning, Python, SQL', 'Advanced', 'MLOps Associate', 'IT', 'employed'],
  ['Harish Ekka', 'Nagpur', 'ITI', 'Fitter', 2022, 'Manual lathe, Measurement', 'Beginner', 'CNC Programmer', 'Manufacturing', 'unemployed'],
  ['Shweta Thorat', 'Navi Mumbai', 'UG', 'B.Pharm', 2023, 'Inventory, Documentation', 'Beginner', 'Healthcare Logistics Assistant', 'Healthcare', 'in-training'],
];

async function seedCandidates() {
  const placements = [
    ['Aarav Sharma', 'EV Technician Fundamentals', 'Tata Motors', 26000, '2026-06-15'],
    ['Priya Deshmukh', 'Solar PV Installation', 'Tata Power Solar', 24000, '2026-05-20'],
    ['Sneha Kulkarni', 'Data Analytics with Python', 'Infosys', 42000, '2026-04-10'],
    ['Vikram Singh', 'CNC Programming', 'Bosch India', 38000, '2025-12-01'],
    ['Neha Joshi', 'PLC & Industrial Automation', 'Siemens India', 44000, '2026-02-15'],
    ['Suresh Pawar', 'Solar PV Installation', 'Self-employed', 30000, '2025-09-01'],
    ['Divya Nair', 'Full Stack Development', 'Infosys', 62000, '2026-01-20'],
    ['Anil Rathod', 'Welding & Fabrication', 'Bajaj Auto', 33000, '2025-11-10'],
    ['Lata Bansode', 'Industrial Electrical Maintenance', 'Maratha Electronics (demo)', 28000, '2026-03-05'],
    ['Sandeep More', 'CNC Programming', 'Mahindra & Mahindra', 41000, '2025-10-15'],
    ['Ritu Verma', 'Machine Learning Foundations', 'Tata Consultancy Services', 68000, '2026-02-28'],
  ];
  for (const c of CANDIDATES) {
    const [name, district, level, degree, year, skills, proficiency, prefRole, prefIndustry, status] = c;
    await insert('education', { level, degree, institute: `${district} Institute (demo)`, year });
    for (const sk of skills.split(',').map((s) => s.trim())) {
      await insert('candidate_skills', { skill: sk, proficiency, years: proficiency === 'Beginner' ? 0.5 : proficiency === 'Intermediate' ? 1.5 : 3 });
    }
    if (['employed', 'seeking'].includes(status)) {
      await insert('certifications', { name: `${degree} Trade Certificate`, issuer: 'NCVET (demo)', year: year + 1 });
    }
    if (['employed', 'seeking', 'self-employed'].includes(status)) {
      await insert('experience', { title: `${prefRole} (trainee)`, company: `${district} Enterprises (demo)`, years: 1, description: `Entry-level work in ${prefIndustry}` });
    }
    if (['in-training', 'apprentice'].includes(status)) {
      await insert('training_history', { course: degree.includes('Solar') || prefIndustry === 'Renewable Energy' ? 'Solar PV Installation' : prefIndustry === 'IT' ? 'Data Analytics with Python' : 'EV Technician Fundamentals', provider: `${district} Skill Centre (demo)`, hours: 120, status: 'Enrolled', completed_on: null });
    }
    if (status === 'seeking' || status === 'unemployed') {
      await insert('applications', { job_title: prefRole, company: `${district} Employers (demo)`, status: 'Applied', applied_on: '2026-08-10' });
    }
  }
  for (const [student, course, employer, salary, placed_on] of placements) {
    await insert('placements', { student, course, employer, salary, placed_on });
    await insert('training_history', { course, provider: 'Pune Skill Development Centre (demo)', hours: 160, status: 'Completed', completed_on: placed_on });
  }
  const outcomes = [
    ['Pune', 'EV Technician', 186, 240, 2025],
    ['Pune', 'EV Technician', 142, 180, 2026],
    ['Mumbai', 'Data Analyst', 210, 260, 2025],
    ['Nashik', 'CNC Operator', 96, 140, 2025],
    ['Satara', 'Solar Installer', 88, 110, 2025],
    ['Kolhapur', 'CNC Operator', 74, 100, 2026],
    ['Nagpur', 'Electrician', 65, 90, 2025],
  ];
  for (const [district, trade, placed, total, year] of outcomes) {
    await insert('employment_outcomes', { district, trade, placed, total, year });
  }
}

async function seedDemoAccounts() {
  // Fixed demo_* ids so every demo_* ownership rule + LIKE filter applies
  // uniformly to documented demo accounts and ephemeral demo sessions.
  const accounts = [
    { id: 'demo_govt', name: 'Demo Government Officer', email: 'demo.govt@kaushalsetu.in', role: 'government', profile: { fullName: 'Demo Government Officer', department: 'Dept. of Skill Development', designation: 'Joint Director', state: 'Maharashtra', district: 'Pune', email: 'demo.govt@kaushalsetu.in', phone: '+912040000001', organization: 'Govt. of Maharashtra (demo)', notifyEmail: 'Enabled', notifySms: 'Disabled' } },
    { id: 'demo_tc', name: 'Demo Centre Head', email: 'demo.tc@kaushalsetu.in', role: 'trainingCentre', profile: { centreName: 'Pune Skill Development Centre', centreId: 'PSD-001', headName: 'Demo Centre Head', email: 'demo.tc@kaushalsetu.in', phone: '+912040000002', state: 'Maharashtra', district: 'Pune', address: 'Bhosari MIDC, Pune (demo)', domains: ['Automotive / EV', 'Manufacturing'], courses: 'EV Technician Fundamentals, CNC Programming', capacity: '420', infrastructure: 'EV lab, CNC hall, 2 classrooms (demo)', trainers: '8 full-time trainers (demo)', accreditation: 'NSQF aligned (demo)' } },
    { id: 'demo_emp', name: 'Demo HR Manager', email: 'demo.emp@kaushalsetu.in', role: 'employer', profile: { companyName: 'Deccan EV Works (demo)', industry: 'Automotive / EV', companySize: '51–200', contactPerson: 'Demo HR Manager', email: 'demo.emp@kaushalsetu.in', phone: '+912040000003', website: 'https://example.in', state: 'Maharashtra', city: 'Pune', address: 'Chakan MIDC, Pune (demo)', hiringDomains: ['Technician', 'Engineering'], requiredSkills: 'EV Diagnostics, Battery Management, CAN Protocol' } },
    { id: 'demo_cand', name: 'Demo Candidate', email: 'demo.cand@kaushalsetu.in', role: 'candidate', profile: { fullName: 'Demo Candidate', email: 'demo.cand@kaushalsetu.in', phone: '+919800000004', state: 'Maharashtra', district: 'Pune', education: 'ITI', degree: 'Electrician', graduationYear: '2023', skills: 'Basic Automotive, Basic electricals', proficiency: 'Beginner', certifications: 'ITI Trade Certificate (demo)', experience: '', preferredIndustry: 'Automotive / EV', preferredRole: 'EV Service Technician', preferredLocation: 'Pune' } },
  ];
  for (const a of accounts) {
    await pool.query(`INSERT INTO users (id, email, name, password_hash, provider, role, onboarded, created_at)
      VALUES ($1, $2, $3, $4, 'email', $5, TRUE, $6) ON CONFLICT (email) DO UPDATE SET name = $3, role = $5, onboarded = TRUE`,
      [a.id, a.email, a.name, hashPassword('Demo@1234'), a.role, now()]);
    const row = await pool.query('SELECT id FROM users WHERE email = $1', [a.email]);
    const userId = row.rows[0].id;
    // Migrate any legacy random id to the fixed demo id (one-time).
    if (userId !== a.id) {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
      await pool.query('UPDATE reports SET owner = $1 WHERE owner = $2', [a.id, userId]);
      await pool.query('UPDATE users SET id = $1 WHERE id = $2', [a.id, userId]);
    }
    await pool.query(`INSERT INTO profiles (user_id, role, data, updated_at) VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET role = $2, data = $3, updated_at = $4`,
      [a.id, a.role, JSON.stringify(a.profile), now()]);
  }
}

async function seedEquipment() {
  const equipment = [
    ['EV Battery Diagnostic Rig', 'EV Lab', 5, 1, 82, 'Fair', 'High'],
    ['1000V HV Safety Kit', 'EV Lab', 6, 2, 70, 'Good', 'High'],
    ['CAN Bus Analyzer', 'EV Lab', 4, 1, 65, 'Good', 'Medium'],
    ['5-Axis CNC Trainer', 'Manufacturing', 2, 0, 0, 'Needs Repair', 'High'],
    ['PLC/SCADA Bench (S7-1200)', 'Automation', 6, 4, 78, 'Good', 'Medium'],
    ['Solar PV Rooftop Rig (5kW)', 'Renewable', 5, 3, 60, 'Good', 'Medium'],
    ['Cold-Chain Demo Unit', 'Logistics', 2, 2, 45, 'Good', 'Low'],
    ['Conventional Lathes', 'Manufacturing', 10, 12, 55, 'Fair', 'Low'],
    ['Welding Stations', 'Construction', 8, 6, 62, 'Fair', 'Medium'],
    ['Computer Lab (30 seats)', 'IT', 2, 2, 88, 'Good', 'Low'],
  ];
  for (const [name, category, required, available, utilization, condition, priority] of equipment) {
    await insert('equipment', { name, category, required, available, utilization, condition, priority });
  }
  const validations = [
    ['EV Diagnostics', 'EV Service Technician', 'Validated', '2026-07-12', 'Confirmed against Tata Motors Nexon EV line requirements'],
    ['Battery Management', 'EV Service Technician', 'Validated', '2026-07-12', 'Confirmed — BMS calibration on live packs'],
    ['CAN Protocol', 'EV Service Technician', 'Validated', '2026-08-03', 'Confirmed — CAN diagnostics in service bays'],
    ['EV Safety', 'Battery Technician', 'Pending', null, 'Awaiting HV audit completion'],
    ['Solar PV Installation', 'Solar PV Installer', 'Validated', '2026-06-20', 'Confirmed — PM Surya Ghar scope'],
  ];
  for (const [skill, job_title, status, validated_on, notes] of validations) {
    await insert('skill_validations', { skill, job_title, status, validated_on, notes });
  }
}

async function main() {
  const force = process.argv.includes('--force');
  const existing = await pool.query(`SELECT COUNT(*)::INT c FROM skill_demand WHERE owner = 'seed'`);
  const equipExisting = await pool.query(`SELECT COUNT(*)::INT c FROM equipment WHERE owner = 'seed'`);
  if (existing.rows[0].c > 0 && !force) {
    if (equipExisting.rows[0].c === 0) {
      console.log('Adding equipment + validation seed rows...');
      await seedEquipment();
      console.log('Equipment seed complete.');
    } else {
      console.log('Demo seed already present — skipping (use --force to reseed).');
    }
    await closePool();
    return;
  }
  if (force) {
    console.log('Clearing previous seed rows...');
    const tables = ['skill_demand', 'district_stats', 'training_centres', 'programmes', 'employment_outcomes', 'employer_demands', 'courses', 'batches', 'trainers', 'equipment', 'skill_validations', 'enrolments', 'placements', 'jobs', 'candidate_skills', 'education', 'certifications', 'experience', 'applications', 'training_history', 'career_recommendations', 'curricula'];
    for (const t of tables) await pool.query(`DELETE FROM ${t} WHERE owner = 'seed'`);
  }
  console.log('Seeding skills + districts...');
  await seedSkills();
  console.log('Seeding employers + jobs...');
  await seedEmployers();
  console.log('Seeding centres + courses + trainers...');
  await seedCentres();
  console.log('Seeding equipment + validations...');
  await seedEquipment();
  console.log('Seeding candidates + outcomes...');
  await seedCandidates();
  console.log('Seeding demo accounts...');
  await seedDemoAccounts();
  const counts = {};
  for (const t of ['skill_demand', 'jobs', 'courses', 'trainers', 'candidate_skills', 'placements', 'users']) {
    const r = await pool.query(`SELECT COUNT(*)::INT c FROM ${t} WHERE ${t === 'users' ? "email LIKE 'demo.%'" : "owner = 'seed'"}`);
    counts[t] = r.rows[0].c;
  }
  console.log('Seed complete:', JSON.stringify(counts));
  await closePool();
}

main().catch(async (e) => {
  console.error('Seed failed:', e.message);
  await closePool();
  process.exit(1);
});
