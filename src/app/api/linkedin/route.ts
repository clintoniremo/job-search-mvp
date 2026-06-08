import { NextResponse } from "next/server";
import { fetchLinkedInProfile, getLinkedInAuthUrl, getProfileDemo, isLinkedInConfigured } from "@/lib/linkedin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const connect = url.searchParams.get("connect");
  const code = url.searchParams.get("code");

  if (connect) {
    if (!isLinkedInConfigured()) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("linkedin", "unconfigured");
      return NextResponse.redirect(redirectUrl);
    }

    try {
      const authUrl = getLinkedInAuthUrl("job-search-mvp-state");
      return NextResponse.redirect(authUrl);
    } catch (error) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("linkedin", "unconfigured");
      return NextResponse.redirect(redirectUrl);
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
