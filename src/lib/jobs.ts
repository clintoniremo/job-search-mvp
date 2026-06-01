import type { Job } from "@/types";
import { searchAdzuna } from "@/lib/adzuna";

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
  const adzunaJobs = await searchAdzuna(query, location);
  sources.push(...adzunaJobs);

  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    sources.push(...sampleAdditionalJobs);
  }

  return dedupeJobs(sources);
}
