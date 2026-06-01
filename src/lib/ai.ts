import type { Job, Profile, MatchResult } from "@/types";

const AI_API_URL = process.env.AI_API_URL;
const AI_API_KEY = process.env.AI_API_KEY;

function safeSkills(text: string): string[] {
  return text
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

function computeScore(job: Job, profile: Profile): number {
  const profileSkills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
  const jobWords = safeSkills(`${job.title} ${job.description}`);
  const matches = jobWords.filter((word) => profileSkills.has(word));
  const score = Math.min(100, Math.max(35, Math.round((matches.length / Math.max(jobWords.length, 1)) * 100)));
  return score;
}

function missingSkills(job: Job, profile: Profile): string[] {
  const jobTokens = safeSkills(`${job.title} ${job.description}`);
  const profileSkills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
  const uniqueMissing = Array.from(new Set(jobTokens.filter((token) => token.length > 3 && !profileSkills.has(token))));
  return uniqueMissing.slice(0, 5);
}

export async function analyzeJob(job: Job, profile: Profile): Promise<MatchResult> {
  if (!AI_API_URL || !AI_API_KEY) {
    const score = computeScore(job, profile);
    const missing = missingSkills(job, profile);
    return {
      score: `${score}%`,
      missingSkills: missing.length ? missing.join(", ") : "None identified",
      tailoredCv: `- Led cross-functional delivery for ${job.title} initiatives at ${profile.experience[0]?.company || "a fast-growing company"}.
- Applied ${profile.skills.slice(0, 3).join(", ")} to improve customer outcomes and operational efficiency.
- Built strong collaboration with product, engineering, and stakeholder partners to exceed goals.`,
      coverLetter: `Dear hiring team,

I am excited to apply for the ${job.title} role at ${job.company}. With experience in ${profile.skills.slice(0, 3).join(", ")} and a proven track record of delivering customer-focused solutions, I am confident I can contribute immediately.

I look forward to discussing how my background aligns with your needs.

Sincerely,
${profile.name}`,
    };
  }

  const prompt = `You are an AI assistant that scores job fit and generates tailored copy. Return JSON with score, missingSkills, tailoredCv, coverLetter.

User profile:
${JSON.stringify(profile, null, 2)}

Job posting:
${JSON.stringify(job, null, 2)}

Respond only with JSON.`;

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";

  try {
    const parsed = JSON.parse(text);
    return {
      score: parsed.score || "N/A",
      missingSkills: parsed.missingSkills || "N/A",
      tailoredCv: parsed.tailoredCv || parsed.tailored_cv || "",
      coverLetter: parsed.coverLetter || parsed.cover_letter || "",
    };
  } catch (error) {
    throw new Error("Unable to parse AI response. Make sure the model returns JSON.");
  }
}
