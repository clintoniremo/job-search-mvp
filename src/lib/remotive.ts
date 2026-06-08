import type { Job } from "@/types";

export async function searchRemotive(query: string, location = ""): Promise<Job[]> {
  const url = new URL("https://remotive.io/api/remote-jobs");
  url.searchParams.set("search", `${query} ${location}`.trim());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Remotive API error ${response.status}`);
  }

  const data = await response.json();
  return (data.jobs || []).map((item: any) => ({
    id: item.id ? `remotive-${item.id}` : `${item.title}-${item.company_name}`,
    title: item.title || "Untitled role",
    company: item.company_name || "Unknown",
    location: item.candidate_required_location || location || "Remote",
    description: item.description || item.job_type || "",
    url: item.url || item.url || "",
    source: "Remotive",
  }));
}
