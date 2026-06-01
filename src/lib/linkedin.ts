import type { Profile } from "@/types";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const demoProfile: Profile = {
  name: "Amina Otieno",
  headline: "Product leader with experience in fintech and mobile platforms",
  location: "Nairobi, Kenya",
  summary: "Strategic product manager with 7+ years building customer-first SaaS and payments experiences.",
  skills: ["Product Strategy", "Stakeholder Management", "Data Analysis", "Go-to-Market", "UX Research"],
  experience: [
    { company: "M-Pesa", title: "Product Lead", years: "3 years" },
    { company: "Jumia", title: "Senior Product Manager", years: "2 years" },
  ],
};

export function getProfileDemo(): Profile {
  return demoProfile;
}

export function getLinkedInAuthUrl(state: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth is not configured.");
  }

  const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", LINKEDIN_CLIENT_ID);
  url.searchParams.set("redirect_uri", LINKEDIN_REDIRECT_URI);
  url.searchParams.set("scope", "r_liteprofile r_emailaddress");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function fetchLinkedInProfile(code: string): Promise<Profile> {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth is not configured.");
  }

  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("LinkedIn token exchange failed.");
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    throw new Error("LinkedIn profile fetch failed.");
  }

  const profileJson = await profileResponse.json();
  const emailResponse = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const emailJson = await emailResponse.json();
  const name = `${profileJson.localizedFirstName || ""} ${profileJson.localizedLastName || ""}`.trim() || "LinkedIn Member";

  return {
    name,
    headline: profileJson.headline || "",
    location: "",
    summary: "",
    skills: ["Product Management", "Stakeholder Engagement"],
    experience: [{ company: "", title: "", years: "" }],
  };
}
