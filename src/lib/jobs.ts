import type { Job } from "@/types";
import { searchAdzuna } from "@/lib/adzuna";
import { searchRemotive } from "@/lib/remotive";

const sampleAdditionalJobs: Job[] = [
  {
    id: "muse-demo-1",
    title: "Software Engineer",
    company: "NovaTech",
    location: "Nairobi, Kenya",
    description:
      "Develop end-to-end software solutions for digital finance products and collaborate closely with data and UX teams.",
    url: "https://themuse.example.com/job/1",
    source: "The Muse",
  },
  {
    id: "muse-demo-2",
    title: "Senior Product Manager",
    company: "FinServe",
    location: "Nairobi, Kenya",
    description:
      "Drive product strategy, partner with engineering leadership, and own roadmap delivery for marketplace payments.",
    url: "https://themuse.example.com/job/2",
    source: "The Muse",
  },
];

function normalizeKey(job: Job) {
  return `${job.title.trim().toLowerCase()}|${job.company.trim().toLowerCase()}`;
}

export function dedupeJobs(jobs: Job[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = normalizeKey(job);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function searchJobs(query: string, location = "Kenya"): Promise<Job[]> {
  const sources: Job[] = [];

  try {
    const remotiveJobs = await searchRemotive(query, location);
    sources.push(...remotiveJobs);
  } catch {
    // Continue with Adzuna fallback or sample jobs.
  }

  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
    try {
      const adzunaJobs = await searchAdzuna(query, location);
      sources.push(...adzunaJobs);
    } catch {
      // Ignore Adzuna errors for live fallback.
    }
  }

  if (sources.length === 0) {
    sources.push(...sampleAdditionalJobs);
  }

  return dedupeJobs(sources);
}
