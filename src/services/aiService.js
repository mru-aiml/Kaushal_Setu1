// KAUSHALSETU — AI service abstraction (Phase 1).
//
// All "AI" features in the UI MUST call through this module — never hard-code
// AI responses inside components. Every function returns `{ data, demo: true,
// notice }` in Phase 1 so the UI can label output honestly as a demo response.
//
// Phase 2: replace each function body with a fetch() to the backend AI gateway
// (backend holds GROK_API_KEY / NVIDIA_API_KEY — keys NEVER live in frontend
// code). Signatures stay identical.

import { PUNE_SCENARIO } from '../data/demoData';

const DEMO_NOTICE = 'Demo AI response — illustrative output. Connects to the production AI service in Phase 2.';
const delay = (ms = 900) => new Promise((r) => setTimeout(r, ms));

export const aiService = {
  notice: DEMO_NOTICE,

  async analyzeJobPosting(posting) {
    await delay();
    const s = PUNE_SCENARIO;
    return {
      demo: true,
      notice: DEMO_NOTICE,
      data: {
        role: posting?.role || s.role,
        demand: 'HIGH',
        confidence: 0.87,
        extractedSkills: [...s.skills, 'Electrical Systems'],
        summary: `Employer demand for ${posting?.role || s.role} in ${posting?.location || s.district} is HIGH and outpaces local training supply.`,
      },
    };
  },

  async analyzeSkillGap({ district, sector } = {}) {
    await delay();
    const s = PUNE_SCENARIO;
    return {
      demo: true,
      notice: DEMO_NOTICE,
      data: {
        district: district || s.district,
        sector: sector || s.sector,
        criticalGaps: [...s.skills],
        severity: 'CRITICAL',
        summary: `Industry demand for EV diagnostics in ${district || s.district} currently exceeds available training supply. Priority: HIGH.`,
      },
    };
  },

  async recommendCurriculum(course) {
    await delay(1100);
    const s = PUNE_SCENARIO;
    return {
      demo: true,
      notice: DEMO_NOTICE,
      data: {
        course: course?.c || s.course,
        currentAlignment: course?.align ?? s.alignment,
        projectedAlignment: 86,
        add: ['EV Diagnostics', 'Battery Management', 'CAN Protocol'],
        addHours: '120h · NSQF L4 · 60% practical + HV safety',
        update: 'Electrical Systems → EV Electrical Systems (40h)',
        capacityLink: `+${s.seats.gap} seats · upskill ${s.trainers.gap} trainers · ${s.equipment.gap} EV diagnostic units (${s.district})`,
      },
    };
  },

  async generateCareerPath({ currentSkills, targetRole } = {}) {
    await delay();
    const s = PUNE_SCENARIO;
    return {
      demo: true,
      notice: DEMO_NOTICE,
      data: {
        from: (currentSkills && currentSkills[0]) || 'Basic Automotive',
        to: targetRole || s.role,
        steps: ['Basic Automotive', 'EV Fundamentals', 'Battery Management', 'EV Diagnostics', s.role],
        courses: ['EV Fundamentals (80h)', 'Battery & BMS (120h)', 'EV Diagnostics Lab (100h)'],
        salaryOutlook: '₹32–40k after certification',
      },
    };
  },
};
