// KAUSHALSETU — centralized role configuration (Phase 1).
// Sidebar, topbar, route guards and onboarding are ALL driven by this object.
// Do not duplicate role logic inside pages.
//
// All numeric demo values live in demoData.js (PUNE_SCENARIO) — do NOT
// duplicate them here. Route protection is enforced in src/routes/guards.jsx;
// the backend must re-enforce authorization in Phase 2.

export const ROLE_IDS = ['government', 'trainingCentre', 'employer', 'candidate'];

export const ROLE_CONFIG = {
  government: {
    id: 'government',
    label: 'Government',
    fullName: 'Government · Policy Maker',
    desc: 'District & state intelligence',
    org: 'Dept. of Skill Development, Maharashtra',
    icon: 'Landmark',
    color: '#2563EB',
    dashboardRoute: '/government',
    onboarding:
      'Labour-market intelligence, district skill gaps, curriculum alignment and training capacity planning.',
    onboardingPoints: ['District-level demand intelligence', 'Skill-gap & curriculum review', 'Training capacity planning'],
    navigationItems: [
      { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', to: '/government' },
      { id: 'districts', label: 'District Skill Intelligence', icon: 'MapPin', to: '/government/districts' },
      { id: 'signals', label: 'Labour-Market Signals', icon: 'RadioTower', to: '/government/signals' },
      { id: 'gaps', label: 'Skill Gap Analysis', icon: 'ScanSearch', to: '/government/skill-gaps' },
      { id: 'curriculum', label: 'Curriculum Alignment', icon: 'BookOpenCheck', to: '/government/curriculum' },
      { id: 'trainer', label: 'Training Capacity', icon: 'Wrench', to: '/government/training-capacity' },
      { id: 'employer', label: 'Employer Validation', icon: 'Handshake', to: '/government/employer-validation' },
      { id: 'centres', label: 'Training Centres', icon: 'School', to: '/government/training-centres' },
      { id: 'outcomes', label: 'Employment Outcomes', icon: 'TrendingUp', to: '/government/employment-outcomes' },
      { id: 'impact', label: 'Programme Impact', icon: 'Target', to: '/government/programme-impact' },
      { id: 'plans', label: 'District Training Plans', icon: 'FileBadge', to: '/government/training-plans' },
      { id: 'reports', label: 'Reports', icon: 'FileText', to: '/government/reports' },
      { id: 'data', label: 'Manage Data', icon: 'Database', to: '/government/data' },
      { id: 'profile', label: 'My Profile', icon: 'UserRound', to: '/government/profile' },
    ],
  },
  trainingCentre: {
    id: 'trainingCentre',
    label: 'Training Centre',
    fullName: 'Training Centre',
    desc: 'Course & capacity management',
    org: 'Pune Skill Development Centre',
    icon: 'School',
    color: '#0D9488',
    dashboardRoute: '/training-centre',
    onboarding: 'Course demand, trainer readiness, infrastructure and curriculum intelligence.',
    onboardingPoints: ['Course demand intelligence', 'Trainer readiness tracking', 'Infrastructure planning'],
    navigationItems: [
      { id: 'tc-dash', label: 'Dashboard', icon: 'LayoutDashboard', to: '/training-centre' },
      { id: 'tc-demand', label: 'Labour-Market Demand', icon: 'TrendingUp', to: '/training-centre/demand' },
      { id: 'tc-align', label: 'Course Alignment', icon: 'BookOpenCheck', to: '/training-centre/course-alignment' },
      { id: 'tc-capacity', label: 'Training Capacity', icon: 'Users', to: '/training-centre/capacity' },
      { id: 'tc-trainers', label: 'Trainer Readiness', icon: 'Award', to: '/training-centre/trainer-readiness' },
      { id: 'tc-infra', label: 'Infrastructure', icon: 'Wrench', to: '/training-centre/infrastructure' },
      { id: 'tc-gaps', label: 'Skill Gaps', icon: 'ScanSearch', to: '/training-centre/skill-gaps' },
      { id: 'tc-plans', label: 'Training Plans', icon: 'FileBadge', to: '/training-centre/training-plans' },
      { id: 'tc-data', label: 'Manage Data', icon: 'Database', to: '/training-centre/data' },
      { id: 'tc-profile', label: 'My Profile', icon: 'UserRound', to: '/training-centre/profile' },
    ],
  },
  employer: {
    id: 'employer',
    label: 'Employer',
    fullName: 'Industry / Employer',
    desc: 'Demand validation & co-creation',
    org: 'ABC Automotive Pvt. Ltd.',
    icon: 'Factory',
    color: '#7C3AED',
    dashboardRoute: '/employer',
    onboarding: 'Submit skill demand, validate skills and collaborate on training requirements.',
    onboardingPoints: ['Skill validation workflows', 'Demand submission', 'Curriculum co-creation'],
    navigationItems: [
      { id: 'em-dash', label: 'Dashboard', icon: 'LayoutDashboard', to: '/employer' },
      { id: 'em-demand', label: 'Industry Demand', icon: 'TrendingUp', to: '/employer/industry-demand' },
      { id: 'em-myreq', label: 'My Requirements', icon: 'ClipboardList', to: '/employer/requirements' },
      { id: 'em-validate', label: 'Skill Validation', icon: 'BadgeCheck', to: '/employer/skill-validation' },
      { id: 'em-emerging', label: 'Emerging Skills', icon: 'Sparkles', to: '/employer/emerging-skills' },
      { id: 'em-submit', label: 'Submit Requirement', icon: 'Send', to: '/employer/submit-requirement' },
      { id: 'em-hiring', label: 'Placement / Hiring Signals', icon: 'Briefcase', to: '/employer/hiring-signals' },
      { id: 'em-data', label: 'Manage Data', icon: 'Database', to: '/employer/data' },
      { id: 'em-profile', label: 'My Profile', icon: 'UserRound', to: '/employer/profile' },
    ],
  },
  candidate: {
    id: 'candidate',
    label: 'Candidate',
    fullName: 'Candidate / Trainee',
    desc: 'Career navigator view',
    org: 'Aspiring EV Service Technician',
    icon: 'UserRound',
    color: '#059669',
    dashboardRoute: '/candidate',
    onboarding: 'Discover skill gaps, career pathways and relevant learning opportunities.',
    onboardingPoints: ['Skill-gap awareness', 'Career pathways', 'Recommended learning'],
    navigationItems: [
      { id: 'ca-dash', label: 'Dashboard', icon: 'LayoutDashboard', to: '/candidate' },
      { id: 'ca-profile', label: 'My Profile', icon: 'UserRound', to: '/candidate/profile' },
      { id: 'ca-skills', label: 'My Skills', icon: 'Award', to: '/candidate/skills' },
      { id: 'ca-gap', label: 'Skill Gap', icon: 'ScanSearch', to: '/candidate/skill-gap' },
      { id: 'ca-nav', label: 'Career Navigator', icon: 'Compass', to: '/candidate/career-navigator' },
      { id: 'ca-courses', label: 'Recommended Courses', icon: 'GraduationCap', to: '/candidate/recommended-courses' },
      { id: 'ca-path', label: 'Career Path', icon: 'Route', to: '/candidate/career-path' },
      { id: 'ca-opp', label: 'Opportunities', icon: 'Briefcase', to: '/candidate/opportunities' },
      { id: 'ca-data', label: 'Manage Data', icon: 'Database', to: '/candidate/data' },
    ],
  },
};

export const ROLE_LIST = ROLE_IDS.map((id) => ROLE_CONFIG[id]);

// Route prefixes owned by each role. Guards use this — never inline role
// checks in pages.
export const ROLE_PREFIXES = {
  government: ['/government', '/overview', '/districts', '/signals', '/skill-gaps', '/curriculum', '/training-capacity', '/employer-validation', '/training-plans', '/career'],
  trainingCentre: ['/training-centre', '/training'],
  employer: ['/employer'],
  candidate: ['/candidate'],
};

// Legacy persona ids (old topbar) map to the new canonical roles.
export function normalizeRole(r) {
  if (r === 'ncvet') return 'government';
  if (r === 'institute') return 'trainingCentre';
  if (ROLE_CONFIG[r]) return r;
  return 'government';
}

export function roleForPath(pathname = '') {
  if (pathname === '/training' || pathname.startsWith('/training-centre') || pathname.startsWith('/training/')) return 'trainingCentre';
  if (pathname.startsWith('/candidate')) return 'candidate';
  // NOTE: /employer-validation is a legacy GOVERNMENT page — it must be
  // matched before the /employer workspace prefix below.
  if (
    pathname.startsWith('/government') ||
    pathname.startsWith('/overview') ||
    pathname.startsWith('/districts') ||
    pathname.startsWith('/signals') ||
    pathname.startsWith('/skill-gaps') ||
    pathname.startsWith('/curriculum') ||
    pathname.startsWith('/training-capacity') ||
    pathname.startsWith('/employer-validation') ||
    pathname.startsWith('/training-plans') ||
    pathname.startsWith('/career')
  )
    return 'government';
  if (pathname === '/employer' || pathname.startsWith('/employer/')) return 'employer';
  return null;
}

// True when `role` is allowed to visit `pathname`. Single source of truth
// for role isolation (mirrored by route guards; backend re-checks in Phase 2).
export function canAccess(pathname = '', role) {
  const owner = roleForPath(pathname);
  if (!owner) return true; // public / unscoped path
  // Legacy government aliases are government-only.
  if (owner === 'government') return role === 'government';
  return normalizeRole(role) === owner;
}
