// AI provider abstraction (backend-only).
// AI_PROVIDER=none            → all AI endpoints return 503 with a clear message.
// AI_PROVIDER=openai-compatible → POSTs to an OpenAI-compatible chat endpoint
//   (works with Groq, NVIDIA NIM, OpenRouter, Ollama, llama.cpp server, …).
// Keys NEVER leave the backend. No fake fallback — failures surface as errors.
import { config, aiConfigured } from './config.js';

export function aiStatus() {
  return {
    configured: aiConfigured(),
    provider: config.aiProvider,
    model: aiConfigured() ? config.aiModel : null,
  };
}

function extractJson(text) {
  if (!text) throw new Error('Empty AI response');
  // Strip code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : text;
  // Try direct parse, then largest {...} span
  try {
    return JSON.parse(candidate);
  } catch { /* fall through */ }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(candidate.slice(start, end + 1));
  }
  throw new Error('AI response was not valid JSON');
}

export async function chatJson({ system, user, maxTokens = 2500 }) {
  if (!aiConfigured()) {
    const err = new Error('AI recommendations are currently unavailable. Configure the AI service to enable this feature.');
    err.status = 503;
    err.code = 'ai_not_configured';
    throw err;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.aiTimeoutMs);
  let res;
  try {
    res = await fetch(`${config.aiBaseUrl}/chat/completions`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.aiApiKey}` },
      body: JSON.stringify({
        model: config.aiModel,
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('AI service timed out. Please try again.');
      err.status = 502;
      err.code = 'ai_timeout';
      throw err;
    }
    const err = new Error('AI service is currently unavailable. Please try again later.');
    err.status = 502;
    err.code = 'ai_unreachable';
    throw err;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const err = new Error(`AI service error (HTTP ${res.status}). Please try again later.`);
    err.status = 502;
    err.code = 'ai_error';
    throw err;
  }
  const body = await res.json();
  const text = body?.choices?.[0]?.message?.content || '';
  try {
    return extractJson(text);
  } catch {
    const err = new Error('AI returned a malformed response. Please regenerate.');
    err.status = 502;
    err.code = 'ai_malformed';
    throw err;
  }
}

const CAREER_SYSTEM = `You are KaushalSetu's workforce advisor. Given a candidate profile plus live platform labour-market data, return ONLY a JSON object with exactly these keys:
{"recommended_roles":[],"skill_gaps":[],"recommended_skills":[],"recommended_courses":[],"career_path":[],"reasoning":[]}
- recommended_roles: array of {role, match ("High"|"Medium"), why, strengths[], missing_skills[], training[], salary_outlook}
- skill_gaps: array of {skill, demand ("High"|"Medium"|"Low"), priority ("Critical"|"High"|"Medium")}
- recommended_skills: array of strings
- recommended_courses: array of {title, hours, provider}
- career_path: array of step strings from current level to target role
- reasoning: array of short strings explaining the recommendation
Be grounded in the provided data. Never promise or guarantee employment.`;

const CURRICULUM_SYSTEM = `You are KaushalSetu's curriculum designer. Given a training request, return ONLY a JSON object with exactly these keys:
{"title":"","objective":"","duration":"","modules":[{"title":"","duration":"","skills":[],"topics":[],"activities":[],"assessment":""}],"final_assessment":"","recommended_resources":[]}
Keep modules practical (at least 50% hands-on activities), aligned to NSQF-style levels. Durations as strings like "20h".`;

export function careerRecommendations(input) {
  const user = `CANDIDATE PROFILE:\n${JSON.stringify(input.profile, null, 1)}\n\nSKILLS TABLE:\n${JSON.stringify(input.skills || [])}\n\nPLATFORM LABOUR-MARKET DATA (real stored demand):\n${JSON.stringify(input.market || [])}\n\nOPEN JOBS (real stored postings):\n${JSON.stringify(input.jobs || [])}\n\nReturn the JSON object only.`;
  return chatJson({ system: CAREER_SYSTEM, user, maxTokens: 3000 });
}

export function generateCurriculum(input) {
  const user = `TRAINING REQUEST:\n${JSON.stringify(input, null, 1)}\n\nReturn the JSON curriculum object only.`;
  return chatJson({ system: CURRICULUM_SYSTEM, user, maxTokens: 3500 });
}

export function validateCareerResult(r) {
  const need = ['recommended_roles', 'skill_gaps', 'recommended_skills', 'recommended_courses', 'career_path', 'reasoning'];
  if (!r || typeof r !== 'object' || !need.every((k) => Array.isArray(r[k]))) {
    const err = new Error('AI returned a malformed response. Please regenerate.');
    err.status = 502;
    err.code = 'ai_malformed';
    throw err;
  }
  return r;
}

export function validateCurriculumResult(r) {
  if (!r || typeof r !== 'object' || !r.title || !Array.isArray(r.modules) || !r.modules.length) {
    const err = new Error('AI returned a malformed response. Please regenerate.');
    err.status = 502;
    err.code = 'ai_malformed';
    throw err;
  }
  return r;
}
