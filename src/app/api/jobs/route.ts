import { NextResponse } from "next/server";
import { searchJobs } from "@/lib/jobs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "Software Engineer";
  const location = url.searchParams.get("location") || "Kenya";

  try {
    const jobs = await searchJobs(query, location);
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
