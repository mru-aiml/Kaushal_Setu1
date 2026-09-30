// Generic entity registry: fields, validation, and role/ownership rules.
// Ownership model:
//  - 'own'   : users CRUD only rows they own (candidate/training-centre/employer private data)
//  - 'gov'   : government manages rows (owner = writer); other roles get read-only
//              access to non-private aggregates where explicitly allowed
import { ENTITY_NAMES } from './db.js';

const F = (name, type = 'text', required = false, options = null) => ({ name, type, required, options });

// type: text | number | date | select
export const ENTITIES = {
  skill_demand: { label: 'Skill Demand', access: 'gov', fields: [F('skill', 'text', true), F('sector'), F('district', 'text', true), F('state'), F('demand_index', 'number', true), F('supply', 'number', true), F('gap', 'select', false, ['High', 'Medium', 'Low']), F('trend'), F('source')] },
  district_stats: { label: 'District Data', access: 'gov', fields: [F('district', 'text', true), F('state'), F('metric', 'text', true), F('value', 'number', true), F('year', 'number')] },
  training_centres: { label: 'Training Centres', access: 'gov', fields: [F('name', 'text', true), F('centre_id'), F('state'), F('district'), F('domains'), F('capacity', 'number'), F('accreditation')] },
  programmes: { label: 'Training Programmes', access: 'gov', fields: [F('name', 'text', true), F('sector'), F('seats', 'number'), F('status', 'select', false, ['Active', 'Planned', 'Completed']), F('start_year', 'number')] },
  employment_outcomes: { label: 'Employment Outcomes', access: 'gov', fields: [F('district', 'text', true), F('trade', 'text', true), F('placed', 'number', true), F('total', 'number', true), F('year', 'number')] },
  employer_demands: { label: 'Employer Demand', access: 'gov', fields: [F('company', 'text', true), F('role', 'text', true), F('skills'), F('openings', 'number'), F('location'), F('status', 'select', false, ['Open', 'Fulfilled', 'Planned'])] },
  courses: { label: 'Courses', access: 'own', roles: ['trainingCentre'], fields: [F('title', 'text', true), F('code'), F('sector'), F('duration_hours', 'number'), F('level'), F('alignment', 'number'), F('status', 'select', false, ['Aligned', 'Review', 'Needs Update'])] },
  batches: { label: 'Batches', access: 'own', roles: ['trainingCentre'], fields: [F('course', 'text', true), F('batch_code', 'text', true), F('seats', 'number', true), F('enrolled', 'number'), F('start_date', 'date'), F('status', 'select', false, ['Planned', 'Running', 'Completed'])] },
  trainers: { label: 'Trainers', access: 'own', roles: ['trainingCentre'], fields: [F('name', 'text', true), F('trade'), F('certification'), F('score', 'number'), F('status', 'select', false, ['Active', 'Upskilling', 'Inactive'])] },
  enrolments: { label: 'Enrolments', access: 'own', roles: ['trainingCentre'], fields: [F('student', 'text', true), F('course', 'text', true), F('batch_code'), F('status', 'select', false, ['Enrolled', 'Completed', 'Dropped']), F('enrolled_on', 'date')] },
  placements: { label: 'Placements & Outcomes', access: 'own', roles: ['trainingCentre'], fields: [F('student', 'text', true), F('course'), F('employer'), F('salary', 'number'), F('placed_on', 'date')] },
  jobs: { label: 'Job Openings', access: 'own', roles: ['employer'], fields: [F('title', 'text', true), F('role', 'text', true), F('industry'), F('skills'), F('experience'), F('location'), F('salary_min', 'number'), F('salary_max', 'number'), F('openings', 'number', true), F('status', 'select', false, ['Open', 'Paused', 'Closed'])] },
  candidate_skills: { label: 'Skills', access: 'own', roles: ['candidate'], fields: [F('skill', 'text', true), F('proficiency', 'select', true, ['Beginner', 'Intermediate', 'Advanced', 'Expert']), F('years', 'number')] },
  education: { label: 'Education', access: 'own', roles: ['candidate'], fields: [F('level', 'select', true, ['10th', '12th', 'ITI', 'Diploma', 'UG', 'PG', 'Other']), F('degree', 'text', true), F('institute'), F('year', 'number')] },
  certifications: { label: 'Certifications', access: 'own', roles: ['candidate'], fields: [F('name', 'text', true), F('issuer'), F('year', 'number')] },
  experience: { label: 'Experience', access: 'own', roles: ['candidate'], fields: [F('title', 'text', true), F('company'), F('years', 'number'), F('description')] },
  applications: { label: 'Applications', access: 'own', roles: ['candidate'], fields: [F('job_title', 'text', true), F('company', 'text', true), F('status', 'select', false, ['Applied', 'Shortlisted', 'Offered', 'Rejected']), F('applied_on', 'date')] },
  training_history: { label: 'Training History', access: 'own', roles: ['candidate'], fields: [F('course', 'text', true), F('provider'), F('hours', 'number'), F('status', 'select', false, ['Enrolled', 'Completed']), F('completed_on', 'date')] },
};

for (const n of ENTITY_NAMES) {
  if (!ENTITIES[n]) throw new Error(`Entity registry missing table: ${n}`);
}

// Entities each role may manage in its Data workspace.
export const ROLE_ENTITIES = {
  government: ['skill_demand', 'district_stats', 'training_centres', 'programmes', 'employment_outcomes', 'employer_demands'],
  trainingCentre: ['courses', 'batches', 'trainers', 'enrolments', 'placements'],
  employer: ['jobs'],
  candidate: ['candidate_skills', 'education', 'certifications', 'experience', 'applications', 'training_history'],
};

// Read-only aggregate access for non-owning roles (dashboards, career matching).
export const READABLE = {
  trainingCentre: ['skill_demand'],
  employer: ['skill_demand'],
  candidate: ['skill_demand', 'jobs'],
  government: Object.keys(ENTITIES),
};

export function canRead(entity, user) {
  const def = ENTITIES[entity];
  if (!def || !user) return false;
  if (def.access === 'gov') return true; // aggregates are readable platform-wide
  if (def.access === 'own') {
    if (user.role === 'government') return true; // oversight reads
    return (def.roles || []).includes(user.role); // owners read own rows (filtered)
  }
  return false;
}

export function canWrite(entity, user) {
  const def = ENTITIES[entity];
  if (!def || !user) return false;
  if (def.access === 'gov') return user.role === 'government';
  if (def.access === 'own') {
    if (user.role === 'government') return false; // government never mutates centre/employer/candidate rows
    return (def.roles || []).includes(user.role);
  }
  return false;
}

// Rows are always scoped: non-government users see only their own rows.
export function ownerScope(entity, user) {
  if (user.role === 'government') return null;
  return user.id;
}

export function validateRow(entity, row) {
  const def = ENTITIES[entity];
  const errors = [];
  const clean = {};
  for (const f of def.fields) {
    let v = row[f.name];
    if (v === '' || v === undefined || v === null) v = null;
    if (f.required && (v === null || String(v).trim() === '')) {
      errors.push(`${f.name}: required`);
      continue;
    }
    if (v !== null) {
      if (f.type === 'number') {
        const n = Number(v);
        if (!Number.isFinite(n)) { errors.push(`${f.name}: must be a number`); continue; }
        v = n;
      } else {
        v = String(v).slice(0, 2000);
      }
      if (f.type === 'select' && f.options && !f.options.includes(v)) {
        errors.push(`${f.name}: must be one of ${f.options.join(', ')}`);
        continue;
      }
    }
    clean[f.name] = v;
  }
  return { clean, errors };
}
