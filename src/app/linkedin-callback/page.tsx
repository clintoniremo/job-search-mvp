"use client";

import { useEffect, useState } from "react";

export default function LinkedInCallbackPage() {
  const [status, setStatus] = useState("Connecting your LinkedIn profile...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorMessage = params.get("error_description") || params.get("error");

    if (errorMessage) {
      setError(`LinkedIn authorization failed: ${errorMessage}`);
      setStatus("Unable to connect your profile.");
      return;
    }

    if (!code) {
      window.location.assign("/api/linkedin?connect=1");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/linkedin?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch profile.");
        }

        window.localStorage.setItem("job-search-profile", JSON.stringify(data.profile));
        setStatus("LinkedIn profile connected successfully! Redirecting...");
        setTimeout(() => {
          window.location.assign("/");
        }, 1200);
      } catch (err) {
        setError((err as Error).message);
        setStatus("Unable to connect your profile.");
      }
    };

    fetchProfile();
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">LinkedIn Connect</p>
          <h1>{status}</h1>
          {error ? <p className="description error">{error}</p> : <p className="description">This page will redirect back once your profile is synced.</p>}
        </div>
      </section>
    </main>
  );
}
