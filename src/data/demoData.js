// KAUSHALSETU — single coherent demonstration scenario.
// All screens must use this same data. Demonstration data only (illustrative, not official statistics).
// All screens must use this same data. Prototype / demonstration data only.

export const PUNE_SCENARIO = {
  district: 'Pune',
  state: 'Maharashtra',
  sector: 'Automotive / EV',
  role: 'EV Service Technician',
  skills: ['EV Diagnostics', 'Battery Management', 'CAN Protocol', 'EV Safety'],
  course: 'EV Technician',
  alignment: 54,
  seats: { current: 240, required: 420, gap: 180 },
  trainers: { current: 8, required: 14, gap: 6 },
  equipment: { current: 12, required: 20, gap: 8 },
};

export const KPI_CARDS = [
  { l: 'In-Demand Skills', v: '128', d: 'Across 7 sectors · demo', c: '#2563EB', bg: '#EFF6FF', i: 'DatabaseZap' },
  { l: 'Critical Skill Gaps', v: '42', d: 'EV · AI · H2 priority', c: '#E11D48', bg: '#FFF1F2', i: 'TrendingUp' },
  { l: 'Courses Requiring Review', v: '17', d: 'Needs update / review', c: '#D97706', bg: '#FFFBEB', i: 'AlertTriangle' },
  { l: 'Districts Analyzed', v: '36', d: 'Maharashtra · demo', c: '#0D9488', bg: '#F0FDFA', i: 'Map' },
];

export const NAV = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', to: '/overview' },
  { id: 'districts', label: 'District Skill Intelligence', icon: 'MapPin', to: '/districts' },
  { id: 'signals', label: 'Labour-Market Signals', icon: 'RadioTower', to: '/signals' },
  { id: 'gaps', label: 'Skill Gap Analysis', icon: 'ScanSearch', to: '/skill-gaps' },
  { id: 'curriculum', label: 'Curriculum Alignment', icon: 'BookOpenCheck', to: '/curriculum' },
  { id: 'trainer', label: 'Training Capacity', icon: 'Wrench', to: '/training-capacity' },
  { id: 'employer', label: 'Employer Validation', icon: 'Handshake', to: '/employer-validation' },
  { id: 'trainee', label: 'Career Navigator', icon: 'Compass', to: '/career' },
  { id: 'plans', label: 'District Training Plans', icon: 'FileBadge', to: '/training-plans' },
];

export const ROLES = [
  { id: 'ncvet', name: 'NCVET · Policy Maker', desc: 'District & state intelligence', icon: 'Landmark', color: '#2563EB', to: '/overview' },
  { id: 'institute', name: 'Training Institute', desc: 'Curriculum designer view', icon: 'School', color: '#0D9488', to: '/curriculum' },
  { id: 'employer', name: 'Industry / Employer', desc: 'Validation & co-creation', icon: 'Factory', color: '#7C3AED', to: '/employer-validation' },
  { id: 'candidate', name: 'Candidate / Trainee', desc: 'Career navigator view', icon: 'UserRound', color: '#059669', to: '/career' },
];

export const SKILLS = [
  { skill: 'EV Battery Diagnostics & BMS', sector: 'Electric Vehicles', demand: 94, supply: 23, gap: 71, yoy: '+42%', level: 'Mid', state: 'Maharashtra', status: 'Critical' },
  { skill: 'AI/ML Model Deployment (MLOps)', sector: 'IT & AI/ML', demand: 91, supply: 34, gap: 57, yoy: '+38%', level: 'Mid', state: 'Karnataka', status: 'Critical' },
  { skill: 'Solar PV Installation & O&M', sector: 'Renewable Energy', demand: 86, supply: 48, gap: 38, yoy: '+31%', level: 'Entry', state: 'Gujarat', status: 'High' },
  { skill: 'CNC 5-Axis Programming', sector: 'Precision Manufacturing', demand: 83, supply: 39, gap: 44, yoy: '+27%', level: 'Mid', state: 'Tamil Nadu', status: 'High' },
  { skill: 'HV Safety & Power Systems', sector: 'Electric Vehicles', demand: 81, supply: 29, gap: 52, yoy: '+35%', level: 'Senior', state: 'Maharashtra', status: 'Critical' },
  { skill: 'Healthcare Logistics & Cold Chain', sector: 'Healthcare', demand: 78, supply: 44, gap: 34, yoy: '+24%', level: 'Entry', state: 'Telangana', status: 'Watch' },
  { skill: 'Green Hydrogen Plant Ops', sector: 'Green Hydrogen', demand: 74, supply: 12, gap: 62, yoy: '+51%', level: 'Senior', state: 'Gujarat', status: 'Emerging' },
  { skill: 'PLC / SCADA Automation', sector: 'Precision Manufacturing', demand: 72, supply: 41, gap: 31, yoy: '+19%', level: 'Mid', state: 'Madhya Pradesh', status: 'Watch' },
];

export const JOBS = [
  { co: 'Tata Motors · Pune', role: 'EV Battery Technician', skills: ['BMS', 'HV Safety', 'CAN diagnostics'], seats: 120, type: 'Full-time', time: '2m ago', surge: '+42% YoY' },
  { co: 'Bosch India · Coimbatore', role: 'PLC Automation Engineer', skills: ['Siemens PLC', 'SCADA', 'Robotics'], seats: 65, type: 'Full-time', time: '9m ago', surge: '+27% YoY' },
  { co: 'Apollo Hospitals · Hyderabad', role: 'Cold-Chain Logistics Exec', skills: ['Cold chain', 'Inventory', 'Pharma GDP'], seats: 80, type: 'Contract', time: '18m ago', surge: '+24% YoY' },
  { co: 'Infosys Topaz · Bengaluru', role: 'MLOps Associate', skills: ['Python', 'Docker', 'Kubeflow'], seats: 200, type: 'Hybrid', time: '26m ago', surge: '+38% YoY' },
  { co: 'Adani Green · Ahmedabad', role: 'Solar O&M Technician', skills: ['PV mounting', 'Inverters', 'Safety'], seats: 150, type: 'On-site', time: '34m ago', surge: '+31% YoY' },
  { co: 'Reliance Hydrogen · Jamnagar', role: 'Electrolyser Operator', skills: ['Hydrogen safety', 'DCS', 'P&ID'], seats: 45, type: 'Full-time', time: '51m ago', surge: '+51% YoY' },
  { co: 'Siemens · Nashik', role: 'CNC 5-Axis Programmer', skills: ['Mastercam', 'GD&T', '5-axis'], seats: 55, type: 'Full-time', time: '1h ago', surge: '+27% YoY' },
];

export const DISTRICTS = [
  { n: 'Pune', s: 'Maharashtra', gap: 71, ind: ['Auto & EV', 'IT', 'Mfg'], supply: '18.2k', pop: '9.4M', score: 58, st: 'critical', quota: { EV: 1200, AI: 800, Solar: 400 }, equip: ['EV battery rig ×4', 'HV safety lab ×1'] },
  { n: 'Coimbatore', s: 'Tamil Nadu', gap: 58, ind: ['Textiles', 'Pumps', 'EV comps'], supply: '14.6k', pop: '3.5M', score: 66, st: 'moderate', quota: { CNC: 900, PLC: 600, EV: 500 }, equip: ['5-axis CNC ×2', 'PLC bench ×6'] },
  { n: 'Bengaluru Urban', s: 'Karnataka', gap: 63, ind: ['IT', 'Aerospace', 'Biotech'], supply: '32.4k', pop: '13M', score: 61, st: 'critical', quota: { AI: 2000, Cloud: 900 }, equip: ['GPU lab ×1 (32×A100)'] },
  { n: 'Indore', s: 'Madhya Pradesh', gap: 44, ind: ['Pharma', 'Food', 'Logistics'], supply: '11.8k', pop: '3.3M', score: 72, st: 'moderate', quota: { Logistics: 700, Pharma: 500 }, equip: ['Cold-chain demo ×2'] },
  { n: 'Ahmedabad', s: 'Gujarat', gap: 52, ind: ['Solar', 'Chemicals', 'Textiles'], supply: '16.1k', pop: '7.2M', score: 68, st: 'moderate', quota: { Solar: 1100, H2: 300 }, equip: ['PV rooftop rig ×5'] },
  { n: 'Hyderabad', s: 'Telangana', gap: 49, ind: ['Pharma', 'IT', 'Health'], supply: '21.3k', pop: '10M', score: 70, st: 'moderate', quota: { Health: 800, AI: 700 }, equip: ['Cold-chain lab ×1'] },
  { n: 'Lucknow', s: 'Uttar Pradesh', gap: 38, ind: ['MSME', 'Handloom', 'Services'], supply: '19.7k', pop: '3.6M', score: 74, st: 'balanced', quota: { Retail: 600, Electrical: 600 }, equip: ['Smart meters ×40'] },
  { n: 'Nashik', s: 'Maharashtra', gap: 66, ind: ['Auto', 'Wine', 'Defence'], supply: '8.4k', pop: '6.1M', score: 59, st: 'critical', quota: { EV: 700, Defence: 300 }, equip: ['EV dyno ×1'] },
  { n: 'Jaipur', s: 'Rajasthan', gap: 31, ind: ['Gems', 'Tourism', 'Solar'], supply: '13.2k', pop: '6.6M', score: 78, st: 'balanced', quota: { Solar: 600, Gems: 300 }, equip: ['PV test bed ×2'] },
];

export const PUNE_ROLES = [
  { r: 'EV Service Technician', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
  { r: 'Battery Technician', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
  { r: 'CNC Operator', dem: 'High', sup: 'Medium', gap: 'Medium', pr: 'High' },
  { r: 'Industrial Automation Technician', dem: 'Medium', sup: 'Low', gap: 'Medium', pr: 'High' },
];

export const GAP_ROWS = [
  { skill: 'EV Diagnostics', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
  { skill: 'Battery Management', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
  { skill: 'CAN Protocol', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
  { skill: 'Electrical Systems', dem: 'High', sup: 'Medium', gap: 'Medium', pr: 'High' },
  { skill: 'EV Safety', dem: 'High', sup: 'Low', gap: 'High', pr: 'Critical' },
];

export const COURSES = [
  { c: 'EV Technician', align: 54, st: 'Needs Update', miss: 'Battery Management, EV Diagnostics, CAN Protocol', cur: ['Automotive Fundamentals', 'Vehicle Maintenance', 'Electrical Systems'], add: ['EV Diagnostics', 'Battery Management', 'CAN Protocol'], upd: 'Electrical Systems → EV Electrical Systems' },
  { c: 'Automotive Technician', align: 82, st: 'Aligned', miss: 'Minor updates', cur: ['Engine Systems', 'Chassis', 'Basic Electricals'], add: ['ADAS awareness'], upd: 'Minor update' },
  { c: 'CNC Programming', align: 76, st: 'Review', miss: 'Advanced Automation', cur: ['Manual machining', 'CNC basics', 'GD&T intro'], add: ['5-axis pathway', 'Robotics tending'], upd: 'CNC → Advanced automation' },
  { c: 'Data Analytics', align: 89, st: 'Aligned', miss: 'Minor updates', cur: ['Excel/SQL', 'Python basics', 'Dashboards'], add: ['GenAI analytics'], upd: 'Minor update' },
];

export const OBSOLETE = [
  { course: 'COPA — Computer Operator (2019 ver)', trade: 'IT', place: '↓ 61% → 34%', issue: 'Teaches Win7-era Office, no cloud / AI tools', risk: 92, action: 'Overhaul', rec: 'Inject Cloud Docs, Prompt Engineering, Python basics (120 hrs)' },
  { course: 'Diesel Mechanic (BS-III era)', trade: 'Auto', place: '↓ 48% → 22%', issue: 'Zero EV / hybrid content; 73% employers flag obsolete', risk: 88, action: 'Merge', rec: 'Merge into EV Service Technician QP; add HV safety + BMS (200 hrs)' },
  { course: 'Stenography (Hindi/English)', trade: 'Office', place: '↓ 55% → 28%', issue: 'Demand replaced by AI transcription; oversupplied 3.2×', risk: 81, action: 'Deprecate', rec: 'Phase out 40% seats; convert to AI Data Annotation (160 hrs)' },
  { course: 'Wireman — Conventional Wiring', trade: 'Electrical', place: '↓ 33% → 41%', issue: 'Missing solar + smart-meter + EV charging content', risk: 74, action: 'Overhaul', rec: 'Add Solar PV + EVSE installation module (140 hrs)' },
  { course: 'Fitter — Manual Lathe Only', trade: 'Manufacturing', place: '↓ 29% → 45%', issue: 'No CNC / CAD-CAM; 5-axis demand +27%', risk: 69, action: 'Overhaul', rec: 'Add CNC programming + Mastercam pathway (180 hrs)' },
  { course: 'ANM — Pre-digital curriculum', trade: 'Healthcare', place: '→ stable 62%', issue: 'Missing cold-chain + HMIS digital health content', risk: 55, action: 'Update', rec: 'Add Cold-chain & HMIS elective (80 hrs)' },
];

export const MAPPER = {
  'Auto-Mechanic (Motor Vehicle)': { syll: [['IC Engine overhaul', 90], ['Carburettor tuning', 85], ['Clutch & gearbox', 78], ['Basic electricals', 70], ['EV basics', 18]], kw: [['EV Battery Diagnostics', 94], ['BMS calibration', 89], ['HV safety (1000V)', 86], ['CAN bus diagnostics', 81], ['ADAS calibration', 73]] },
  'Electrician — Power Distribution': { syll: [['House wiring', 88], ['Motor rewinding', 76], ['Transformers', 68], ['Solar basics', 32]], kw: [['Solar PV install', 86], ['Smart meters', 79], ['EV charger install', 83], ['SCADA', 64]] },
  'General Nursing & Midwifery': { syll: [['Anatomy', 90], ['Midwifery', 82], ['Pharmacology', 75], ['Digital health', 22]], kw: [['Cold-chain handling', 78], ['HMIS / ABDM', 74], ['Geriatric care', 69], ['Tele-triage', 66]] },
  'COPA — Computer Operator': { syll: [['MS Office 2016', 85], ['Typing', 80], ['Tally', 62], ['Cloud / AI', 12]], kw: [['Prompt engineering', 88], ['Python basics', 84], ['Cloud docs', 81], ['Data annotation', 77]] },
  'Fitter — Precision Manufacturing': { syll: [['Manual lathe', 86], ['Filing & fitting', 78], ['Welding basics', 65], ['CNC', 28]], kw: [['5-axis CNC', 83], ['GD&T', 79], ['Mastercam', 76], ['Robotics tending', 71]] },
};

export const CLUSTERS = [
  { c: 'EV Battery Pack Assembly', co: 'Tata Motors', skills: 'BMS · HV safety · Torque tools', seats: 340, itis: 'ITI Bhosari, ITI Nashik', match: 86 },
  { c: 'MLOps Deployment Pod', co: 'Infosys Topaz', skills: 'Python · Docker · K8s', seats: 520, itis: 'Polytechnic Bengaluru, IIIT-H skilling', match: 78 },
  { c: 'Solar Rooftop Crew (PM Surya Ghar)', co: 'Adani Green', skills: 'PV mounting · Net-metering', seats: 610, itis: 'ITI Ahmedabad ×3', match: 91 },
  { c: 'Cold-Chain Pharma Corridor', co: 'Apollo + Snowman', skills: 'GDP · IoT loggers · WMS', seats: 210, itis: 'ITI Hyderabad, Lucknow', match: 73 },
  { c: '5-Axis Aerospace Cell', co: 'Siemens / HAL Nashik', skills: 'Mastercam · GD&T · CMM', seats: 140, itis: 'ITI Nashik, Coimbatore', match: 68 },
];

export const ENDORSEMENTS = [
  { co: 'Tata Motors · P. Kulkarni', txt: 'Endorsed “EV Battery Diagnostics (200h)” module — aligns with our Nexon EV line. Pledging 120 seats in Pune.', t: '12m ago', k: 'pledge' },
  { co: 'Bosch · R. Iyer', txt: 'Validated PLC/SCADA demand +27% — will co-deliver 2-week automation bootcamp at Coimbatore.', t: '44m ago', k: 'endorse' },
  { co: 'Apollo · Dr. S. Rao', txt: 'Cold-chain GDP module approved. Offering 40 internships + equipment loan (data loggers).', t: '1h ago', k: 'pledge' },
];

export const TRAINERS = [
  { n: 'S. Deshmukh', trade: 'Auto / EV', score: 82, cert: 'HV L3 · ARAI', ok: true },
  { n: 'R. Nair', trade: 'Mechatronics', score: 74, cert: 'Siemens PLC', ok: true },
  { n: 'P. Yadav', trade: 'Electrician', score: 48, cert: '—', ok: false },
  { n: 'K. Subramani', trade: 'Fitter / CNC', score: 66, cert: 'Mastercam', ok: true },
  { n: 'A. Sheikh', trade: 'COPA / IT', score: 39, cert: '—', ok: false },
  { n: 'M. Rao', trade: 'Healthcare', score: 71, cert: 'HMIS · GDP', ok: true },
  { n: 'V. Patil', trade: 'Solar', score: 78, cert: 'NSEFI PV', ok: true },
  { n: 'J. Ekka', trade: 'Welding', score: 52, cert: '—', ok: false },
];

export const EQUIPMENT = [
  { item: 'EV Battery Diagnostic Rig (with BMS emulator)', have: 1, need: 5, st: 'gap', cost: '₹18.5L' },
  { item: '1000V HV Safety Kit (gloves, insulation tester)', have: 2, need: 6, st: 'gap', cost: '₹4.2L' },
  { item: '5-Axis CNC Trainer + Mastercam licences (10)', have: 0, need: 2, st: 'critical', cost: '₹64L' },
  { item: 'Solar PV Rooftop Training Rig (5kW)', have: 3, need: 5, st: 'partial', cost: '₹9.8L' },
  { item: 'PLC/SCADA Bench (Siemens S7-1200 ×6)', have: 4, need: 6, st: 'partial', cost: '₹12L' },
  { item: 'Cold-Chain Demo Unit + IoT loggers', have: 2, need: 2, st: 'ready', cost: '—' },
  { item: 'Conventional lathes (overhauled 2023)', have: 12, need: 10, st: 'ready', cost: '—' },
];

export const CAREER_PATH = ['Basic Automotive', 'EV Fundamentals', 'Battery Management', 'EV Diagnostics', 'EV Service Technician'];
export const TOP_SKILLS = ['EV Diagnostics', 'Battery Management', 'CAN Protocol'];

export const SIGNAL_POSTING = {
  role: 'EV Service Engineer',
  location: 'Pune',
  sector: 'Automotive / EV',
  required: ['EV Diagnostics', 'Battery Management Systems', 'CAN Protocol', 'Electrical Systems', 'Vehicle Diagnostics'],
};
