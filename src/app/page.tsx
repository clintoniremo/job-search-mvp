"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import type { ApplicationRecord, Job, Profile, MatchResult } from "@/types";

const PROFILE_STORAGE_KEY = "job-search-profile";

export default function HomePage() {
  const [query, setQuery] = useState("Software Engineer");
  const [location, setLocation] = useState("Kenya");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<ApplicationRecord[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<ApplicationRecord["status"] | "All">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }

    const storedApplications = window.localStorage.getItem("job-search-applications");
    if (storedApplications) {
      try {
        setAppliedJobs(JSON.parse(storedApplications));
      } catch {
        window.localStorage.removeItem("job-search-applications");
      }
    }

    const storedFavorites = window.localStorage.getItem("job-search-favorites");
    if (storedFavorites) {
      try {
        setFavoriteIds(JSON.parse(storedFavorites));
      } catch {
        window.localStorage.removeItem("job-search-favorites");
      }
    }
  }, []);

  const saveProfile = (profileData: Profile) => {
    setProfile(profileData);
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  };

  const saveApplications = (applications: ApplicationRecord[]) => {
    setAppliedJobs(applications);
    window.localStorage.setItem("job-search-applications", JSON.stringify(applications));
  };

  const saveFavorites = (favorites: string[]) => {
    setFavoriteIds(favorites);
    window.localStorage.setItem("job-search-favorites", JSON.stringify(favorites));
  };

  const toggleFavorite = (job: Job) => {
    const nextFavorites = favoriteIds.includes(job.id)
      ? favoriteIds.filter((id) => id !== job.id)
      : [job.id, ...favoriteIds];
    saveFavorites(nextFavorites);
  };

  const updateApplicationStatus = (appliedAt: string, status: ApplicationRecord["status"]) => {
    const next = appliedJobs.map((record) =>
      record.appliedAt === appliedAt ? { ...record, status } : record
    );
    saveApplications(next);
  };

  const filteredApplications =
    applicationStatusFilter === "All"
      ? appliedJobs
      : appliedJobs.filter((record) => record.status === applicationStatusFilter);

  const downloadApplicationsCsv = () => {
    const rows = [
      ["Job Title", "Company", "Applied At", "Status", "Score", "Job Source", "Job URL"],
      ...filteredApplications.map((record) => [
        record.job.title,
        record.job.company,
        new Date(record.appliedAt).toLocaleString(),
        record.status,
        record.result.score,
        record.job.source,
        record.job.url,
      ]),
    ];

    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applied-jobs.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyToJob = async (job: Job) => {
    if (!profile) {
      setError("Load a LinkedIn profile before applying.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, profile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Apply request failed");

      const record: ApplicationRecord = {
        job,
        result: data.result,
        appliedAt: new Date().toISOString(),
        status: "Applied",
      };
      saveApplications([record, ...appliedJobs]);
      setSelectedJob(job);
      setMatchResult(data.result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Unable to copy text to clipboard.");
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load jobs");
      setJobs(data.jobs || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/linkedin");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");
      saveProfile(data.profile);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async (job: Job) => {
    if (!profile) {
      setError("Load a LinkedIn profile before analyzing jobs.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI analysis failed");
      setSelectedJob(job);
      setMatchResult(data.result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = ["All", ...Array.from(new Set(jobs.map((job) => job.source)))];

  const filteredJobs = jobs.filter((job) => {
    if (showFavoritesOnly && !favoriteIds.includes(job.id)) {
      return false;
    }
    if (sourceFilter !== "All" && job.source !== sourceFilter) {
      return false;
    }
    return true;
  });

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Job Search MVP</p>
          <h1>AI-powered job aggregation and match scoring</h1>
          <p className="description">
            Load jobs from Adzuna, sync a LinkedIn profile, and generate match scores, tailored CV bullets, and a cover letter draft.
          </p>
        </div>
        <div className="controls">
          <button onClick={loadProfile} disabled={loading} className="button button-primary">
            Load demo LinkedIn profile
          </button>
          <button
            onClick={() => window.location.assign("/linkedin-callback?connect=1")}
            disabled={loading}
            className="button"
          >
            Connect LinkedIn
          </button>
          <button onClick={loadJobs} disabled={loading} className="button">
            Fetch jobs
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="form-row">
          <label>Search query</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="form-row" style={{ gap: "12px" }}>
          <label>Job source</label>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row form-row-inline">
          <label>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            />
            Show favorites only
          </label>
        </div>
      </section>

      {error ? <div className="toast error">{error}</div> : null}
      {loading ? <div className="toast">Loading…</div> : null}

      <section className="grid-layout">
        <div className="card profile-card">
          <h2>LinkedIn profile</h2>
          {profile ? (
            <>
              <p className="profile-name">{profile.name}</p>
              <p>{profile.headline}</p>
              <p>{profile.location}</p>
              <div>
                <h3>Top skills</h3>
                <ul className="tag-list">
                  {profile.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p>Load your profile to enable AI scoring.</p>
          )}
        </div>

        <div className="card jobs-card">
          <h2>Job feed</h2>
          <p className="job-count">{filteredJobs.length} jobs shown{showFavoritesOnly ? " (favorites only)" : ""}</p>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isFavorite={favoriteIds.includes(job.id)}
                onAnalyze={analyzeJob}
                onApply={applyToJob}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <p>{showFavoritesOnly ? "No favorited jobs yet." : "No jobs loaded yet. Click Fetch jobs to start."}</p>
          )}
        </div>
      </section>

      {matchResult && selectedJob ? (
        <section className="card analysis-card">
          <h2>Match analysis for:</h2>
          <p className="job-title">{selectedJob.title} · {selectedJob.company}</p>
          <div className="match-stats">
            <div>
              <strong>Score</strong>
              <p>{matchResult.score}</p>
            </div>
            <div>
              <strong>Missing skills</strong>
              <p>{matchResult.missingSkills}</p>
            </div>
          </div>
          <div className="action-row">
            <button className="button button-secondary" onClick={() => copyToClipboard(matchResult.coverLetter)}>
              Copy cover letter
            </button>
            <button className="button button-secondary" onClick={() => copyToClipboard(matchResult.tailoredCv)}>
              Copy CV bullets
            </button>
          </div>
          <div>
            <h3>Tailored CV bullets</h3>
            <pre>{matchResult.tailoredCv}</pre>
          </div>
          <div>
            <h3>Cover letter draft</h3>
            <pre>{matchResult.coverLetter}</pre>
          </div>
        </section>
      ) : null}

      {appliedJobs.length > 0 ? (
        <section className="card application-card">
          <div className="application-header">
            <div>
              <h2>Applied jobs</h2>
              <p>{filteredApplications.length} applications shown</p>
            </div>
            <div className="application-controls">
              <label>
                Status filter
                <select
                  value={applicationStatusFilter}
                  onChange={(e) => setApplicationStatusFilter(e.target.value as ApplicationRecord["status"] | "All")}
                >
                  <option value="All">All</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>
              <button className="button button-secondary" onClick={downloadApplicationsCsv}>
                Export CSV
              </button>
            </div>
          </div>
          <div className="application-list">
            {appliedJobs.map((record) => (
              <div key={`${record.job.id}-${record.appliedAt}`} className="application-item">
                <div>
                  <div className="application-heading">
                    <p className="job-title-card">{record.job.title}</p>
                    <span className={`status-badge status-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="job-company">{record.job.company} · {new Date(record.appliedAt).toLocaleString()}</p>
                </div>
                <div className="application-meta">
                  <div>
                    <p className="meta-label">Score</p>
                    <p className="job-source">{record.result.score}</p>
                  </div>
                  <div>
                    <label className="meta-label" htmlFor={`status-${record.appliedAt}`}>
                      Status
                    </label>
                    <select
                      id={`status-${record.appliedAt}`}
                      value={record.status}
                      onChange={(e) => updateApplicationStatus(record.appliedAt, e.target.value as ApplicationRecord["status"])}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
