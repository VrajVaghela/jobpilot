import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { runJobDiscovery } from "@/agent/adzuna";

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: authError,
    } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { jobTitle, location } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Missing required parameter: jobTitle" },
        { status: 400 }
      );
    }

    // Run the Job Discovery Agent
    const result = await runJobDiscovery(user.id, jobTitle.trim(), (location || "").trim());

    return NextResponse.json({
      success: true,
      totalFound: result.totalFound,
      matchesSaved: result.matchesSaved,
    });
  } catch (err: any) {
    console.error("[api/agent/find] Route handler error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
