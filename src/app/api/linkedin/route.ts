import { NextResponse } from "next/server";
import { fetchLinkedInProfile, getLinkedInAuthUrl, getProfileDemo } from "@/lib/linkedin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const connect = url.searchParams.get("connect");
  const code = url.searchParams.get("code");

  if (connect) {
    try {
      const authUrl = getLinkedInAuthUrl("job-search-mvp-state");
      return NextResponse.redirect(authUrl);
    } catch (error) {
      return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
  }

  if (code) {
    try {
      const profile = await fetchLinkedInProfile(code);
      return NextResponse.json({ profile });
    } catch (error) {
      return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ profile: getProfileDemo() });
}
