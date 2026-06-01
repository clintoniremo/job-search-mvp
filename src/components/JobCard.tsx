import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
  isFavorite: boolean;
  onAnalyze: (job: Job) => void;
  onApply: (job: Job) => void;
  onToggleFavorite: (job: Job) => void;
}

export function JobCard({ job, isFavorite, onAnalyze, onApply, onToggleFavorite }: JobCardProps) {
  return (
    <div className="job-card">
      <div className="job-header">
        <div>
          <p className="job-title-card">{job.title}</p>
          <p className="job-company">{job.company} · {job.location}</p>
        </div>
        <div className="job-actions">
          <button className="button button-outline" onClick={() => onAnalyze(job)}>
            Analyze
          </button>
          <button className="button button-secondary" onClick={() => onToggleFavorite(job)}>
            {isFavorite ? "Unfavorite" : "Favorite"}
          </button>
          <button className="button button-primary" onClick={() => onApply(job)}>
            Apply
          </button>
        </div>
      </div>
      <p className="job-source">Source: {job.source}</p>
      <p className="job-description">{job.description}</p>
      <a href={job.url} target="_blank" rel="noreferrer" className="job-link">
        View job posting
      </a>
    </div>
  );
}
