export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Array<{ company: string; title: string; years: string }>;
}

export interface MatchResult {
  score: string;
  missingSkills: string;
  tailoredCv: string;
  coverLetter: string;
}

export interface ApplicationRecord {
  job: Job;
  result: MatchResult;
  appliedAt: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
}
