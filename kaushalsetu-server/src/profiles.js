// Role-specific profile schemas + completion scoring (PostgreSQL-backed).
// Profiles persist in the `profiles` table (JSONB data + photo/resume text).
import { get, run } from './db/pg.js';
import { now } from './util.js';

const T = (name, label, type = 'text', opts = {}) => ({ name, label, type, ...opts });
// type: text|email|phone|number|date|select|multiselect|textarea|year
const IN = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'Gujarat', 'Telangana', 'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Other'];

export const PROFILE_SCHEMAS = {
  government: [
    T('fullName', 'Full name', 'text', { required: true }),
    T('department', 'Department / Ministry', 'text', { required: true }),
    T('designation', 'Designation', 'text', { required: true }),
    T('state', 'State', 'select', { options: IN, required: true }),
    T('district', 'District', 'text', { required: true }),
    T('email', 'Official email', 'email', { required: true }),
    T('phone', 'Phone', 'phone'),
    T('organization', 'Organization', 'text'),
    T('notifyEmail', 'Email notifications', 'select', { options: ['Enabled', 'Disabled'] }),
    T('notifySms', 'SMS alerts', 'select', { options: ['Enabled', 'Disabled'] }),
  ],
  trainingCentre: [
    T('centreName', 'Centre name', 'text', { required: true }),
    T('centreId', 'Centre ID', 'text', { required: true }),
    T('headName', 'Head / administrator name', 'text', { required: true }),
    T('email', 'Email', 'email', { required: true }),
    T('phone', 'Phone', 'phone', { required: true }),
    T('state', 'State', 'select', { options: IN, required: true }),
    T('district', 'District', 'text', { required: true }),
    T('address', 'Address', 'textarea'),
    T('domains', 'Training domains', 'multiselect', { options: ['Automotive / EV', 'IT & AI/ML', 'Manufacturing', 'Healthcare', 'Renewable Energy', 'Construction', 'Other'] }),
    T('courses', 'Available courses', 'textarea'),
    T('capacity', 'Total capacity (seats)', 'number'),
    T('infrastructure', 'Infrastructure information', 'textarea'),
    T('trainers', 'Trainer information', 'textarea'),
    T('accreditation', 'Accreditation / affiliation', 'text'),
  ],
  employer: [
    T('companyName', 'Company name', 'text', { required: true }),
    T('industry', 'Industry', 'select', { required: true, options: ['Automotive / EV', 'IT & AI/ML', 'Manufacturing', 'Healthcare', 'Renewable Energy', 'Logistics', 'Construction', 'Other'] }),
    T('companySize', 'Company size', 'select', { options: ['1–50', '51–200', '201–1000', '1000+'] }),
    T('contactPerson', 'HR / contact person', 'text', { required: true }),
    T('email', 'Official email', 'email', { required: true }),
    T('phone', 'Phone', 'phone', { required: true }),
    T('website', 'Website', 'text'),
    T('state', 'State', 'select', { options: IN }),
    T('city', 'City', 'text', { required: true }),
    T('address', 'Address', 'textarea'),
    T('hiringDomains', 'Hiring domains', 'multiselect', { options: ['Engineering', 'Technician', 'IT', 'Operations', 'Sales', 'Support', 'Other'] }),
    T('requiredSkills', 'Required skills', 'textarea'),
  ],
  candidate: [
    T('fullName', 'Full name', 'text', { required: true }),
    T('email', 'Email', 'email', { required: true }),
    T('phone', 'Phone', 'phone', { required: true }),
    T('dob', 'Date of birth', 'date'),
    T('state', 'State', 'select', { options: IN, required: true }),
    T('district', 'District', 'text', { required: true }),
    T('education', 'Education', 'select', { options: ['10th', '12th', 'ITI', 'Diploma', 'UG', 'PG', 'Other'] }),
    T('degree', 'Degree / course', 'text'),
    T('graduationYear', 'Graduation year', 'year'),
    T('skills', 'Current skills', 'textarea', { required: true, hint: 'Comma-separated, e.g. Basic Automotive, Two-wheeler repair' }),
    T('proficiency', 'Overall skill proficiency', 'select', { options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }),
    T('certifications', 'Certifications', 'textarea'),
    T('experience', 'Work experience', 'textarea'),
    T('preferredIndustry', 'Preferred industry', 'select', { options: ['Automotive / EV', 'IT & AI/ML', 'Manufacturing', 'Healthcare', 'Renewable Energy', 'Logistics', 'Other'] }),
    T('preferredRole', 'Preferred job role', 'text'),
    T('preferredLocation', 'Preferred location', 'text'),
  ],
};

export function validateProfile(role, data) {
  const schema = PROFILE_SCHEMAS[role] || [];
  const errors = {};
  const clean = {};
  for (const f of schema) {
    let v = data[f.name];
    if (Array.isArray(v)) v = v.map((x) => String(x).slice(0, 500));
    else if (v === '' || v === undefined || v === null) v = null;
    else v = String(v).slice(0, 4000);
    if (f.required && (v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === ''))) {
      errors[f.name] = 'Required';
      continue;
    }
    if (v !== null && !Array.isArray(v)) {
      if (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { errors[f.name] = 'Invalid email'; continue; }
      if (f.type === 'phone' && !/^[+\d][\d\s-]{6,15}$/.test(v)) { errors[f.name] = 'Invalid phone'; continue; }
      if (f.type === 'number' && !Number.isFinite(Number(v))) { errors[f.name] = 'Must be a number'; continue; }
      if (f.type === 'year' && !/^(19|20)\d{2}$/.test(v)) { errors[f.name] = 'Enter a valid year'; continue; }
      if (f.type === 'select' && f.options && !f.options.includes(v)) { errors[f.name] = 'Invalid option'; continue; }
    }
    clean[f.name] = v;
  }
  return { clean, errors };
}

export function completionOf(role, data) {
  const schema = PROFILE_SCHEMAS[role] || [];
  if (!schema.length) return 0;
  let got = 0;
  for (const f of schema) {
    const v = data[f.name];
    if (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== '') got++;
  }
  return Math.round((got / schema.length) * 100);
}

export async function getProfile(userId, role) {
  const row = await get('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  if (!row) return { role, data: {}, photo: null, resumeName: null, hasResume: false, completion: 0 };
  const data = row.data || {};
  return {
    role: row.role || role,
    data: typeof data === 'string' ? JSON.parse(data) : data,
    photo: row.photo || null,
    resumeName: row.resume_name || null,
    hasResume: !!row.resume,
    completion: completionOf(row.role || role, typeof data === 'string' ? JSON.parse(data) : data),
    updatedAt: row.updated_at,
  };
}

export async function saveProfile(userId, role, data, { photo, resumeName, resume } = {}) {
  const existing = await get('SELECT user_id FROM profiles WHERE user_id = $1', [userId]);
  const payload = JSON.stringify(data);
  if (existing) {
    await run(`UPDATE profiles SET role = $1, data = $2,
      photo = COALESCE($3, photo), resume_name = COALESCE($4, resume_name), resume = COALESCE($5, resume),
      updated_at = $6 WHERE user_id = $7`,
      [role, payload, photo ?? null, resumeName ?? null, resume ?? null, now(), userId]);
  } else {
    await run('INSERT INTO profiles (user_id, role, data, photo, resume_name, resume, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId, role, payload, photo || null, resumeName || null, resume || null, now()]);
  }
  return getProfile(userId, role);
}
