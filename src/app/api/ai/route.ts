import { NextResponse } from "next/server";
import { analyzeJob } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { job, profile } = body;
    if (!job || !profile) {
      return NextResponse.json({ message: "Job and profile are required." }, { status: 400 });
    }

    const result = await analyzeJob(job, profile);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
