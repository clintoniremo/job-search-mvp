import type { Job } from "@/types";

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

const sampleJobs: Job[] = [
  {
    id: "adzuna-demo-1",
    title: "Software Engineer",
    company: "NovaTech",
    location: "Nairobi, Kenya",
    description:
      "Build scalable backend services, collaborate with product teams, and improve data pipelines.",
    url: "https://adzuna.example.com/job/1",
    source: "Adzuna",
  },
  {
    id: "adzuna-demo-2",
    title: "Product Manager",
    company: "FinServe",
    location: "Nairobi, Kenya",
    description:
      "Lead product discovery, coordinate go-to-market activities, and define customer requirements.",
    url: "https://adzuna.example.com/job/2",
    source: "Adzuna",
  },
];

export async function searchAdzuna(query: string, location = "Kenya"): Promise<Job[]> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return sampleJobs;
  }

  const searchUrl = new URL(`https://api.adzuna.com/v1/api/jobs/ke/search/1`);
  searchUrl.searchParams.set("app_id", ADZUNA_APP_ID);
  searchUrl.searchParams.set("app_key", ADZUNA_APP_KEY);
  searchUrl.searchParams.set("results_per_page", "10");
  searchUrl.searchParams.set("what", query);
  searchUrl.searchParams.set("where", location);
  searchUrl.searchParams.set("content-type", "application/json");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`Adzuna API error ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map((item: any) => ({
    id: item.id || `${item.title}-${item.company.display_name}-${item.location.display_name}`,
    title: item.title,
    company: item.company?.display_name || "Unknown",
    location: item.location?.display_name || location,
    description: item.description || item.summary || "",
    url: item.redirect_url || item.redirect_url || "",
    source: "Adzuna",
  }));
}
