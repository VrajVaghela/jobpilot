import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { runCompanyResearch } from "@/agent/research";

export const maxDuration = 300;

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
    const { jobId } = body as { jobId?: string };

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required parameter: jobId" },
        { status: 400 }
      );
    }

    const dossier = await runCompanyResearch(jobId, user.id);

    return NextResponse.json({ success: true, dossier });
  } catch (err: any) {
    console.error("[api/agent/research] Route handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
