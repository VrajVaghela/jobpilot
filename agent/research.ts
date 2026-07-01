import { z } from "zod";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createBrowserbaseSession, isBrowserbaseConfigured } from "@/lib/browserbase";
import { createStagehand } from "@/lib/stagehand";

const LINK_KIND_PRIORITY = [
  "engineering",
  "product",
  "about",
  "blog",
  "team",
  "careers",
  "other",
] as const;
type LinkKind = (typeof LINK_KIND_PRIORITY)[number];

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z
    .string()
    .describe("What they build/sell and who it's for"),
  signals: z
    .array(z.string())
    .describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum([
          "about",
          "careers",
          "blog",
          "engineering",
          "product",
          "team",
          "other",
        ]),
      })
    )
    .describe("Internal links worth visiting"),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z
    .array(z.string())
    .describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z
    .array(z.string())
    .describe("Stated values, working style, team norms"),
  notable: z
    .array(z.string())
    .describe("Customers, funding, scale, projects, awards"),
});

const dossierSchema = {
  type: SchemaType.OBJECT,
  properties: {
    companyOverview: { type: SchemaType.STRING },
    techStack: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    culture: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    whyThisRole: { type: SchemaType.STRING },
    yourEdge: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    gapsToAddress: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    smartQuestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    interviewPrep: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    "companyOverview",
    "techStack",
    "culture",
    "whyThisRole",
    "yourEdge",
    "gapsToAddress",
    "smartQuestions",
    "interviewPrep",
  ],
};

export type CompanyDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

type CompanyResearchRaw = {
  homepage: z.infer<typeof homepageSchema> | null;
  subPages: Array<{ url: string; kind: LinkKind; content: z.infer<typeof subPageSchema> }>;
};

async function logAgent(
  insforge: any,
  userId: string,
  message: string,
  level: "info" | "success" | "warning" | "error" = "info",
  jobId?: string
) {
  console.log(`[Research Agent - ${level.toUpperCase()}] ${message}`);
  try {
    await insforge.database.from("agent_logs").insert({
      user_id: userId,
      message,
      level,
      job_id: jobId || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write to agent_logs:", err);
  }
}

/**
 * Resolve the company's real homepage URL.
 * 1. Follow the Adzuna redirect_url with fetch() to land on the employer page.
 * 2. Strip the subdomain (jobs.stripe.com -> stripe.com).
 * 3. If anything fails or we're still inside adzuna.com, fall back to https://www.{company}.com.
 */
async function deriveHomepageUrl(
  redirectUrl: string | null,
  companyName: string | null
): Promise<string | null> {
  const cleanFallback = () => {
    if (!companyName) return null;
    const clean = companyName
      .replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?).*$/i, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
    return clean ? `https://www.${clean}.com` : null;
  };

  if (!redirectUrl) return cleanFallback();

  try {
    const res = await fetch(redirectUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    const finalUrl = new URL(res.url);
    if (finalUrl.hostname.includes("adzuna.com")) return cleanFallback();

    const parts = finalUrl.hostname.split(".");
    const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : finalUrl.hostname;
    return `https://${rootDomain}`;
  } catch {
    return cleanFallback();
  }
}

function selectSubPageLinks(
  homepageUrl: string,
  links: z.infer<typeof homepageSchema>["pageLinks"]
): Array<{ url: string; kind: LinkKind }> {
  const homeOrigin = new URL(homepageUrl).hostname.replace(/^www\./, "");
  const seen = new Set<string>();
  const resolved: Array<{ url: string; kind: LinkKind }> = [];

  for (const link of links) {
    let absolute: URL;
    try {
      absolute = new URL(link.url, homepageUrl);
    } catch {
      continue;
    }
    const host = absolute.hostname.replace(/^www\./, "");
    if (!host.endsWith(homeOrigin)) continue;
    const key = absolute.toString().split("#")[0];
    if (seen.has(key)) continue;
    if (key === homepageUrl || key === homepageUrl + "/") continue;
    seen.add(key);
    resolved.push({ url: key, kind: link.kind as LinkKind });
  }

  resolved.sort(
    (a, b) =>
      LINK_KIND_PRIORITY.indexOf(a.kind) - LINK_KIND_PRIORITY.indexOf(b.kind)
  );
  return resolved.slice(0, 3);
}

async function runBrowserResearch(
  homepageUrl: string,
  userId: string,
  jobId: string,
  insforge: any
): Promise<CompanyResearchRaw> {
  const raw: CompanyResearchRaw = { homepage: null, subPages: [] };

  if (!isBrowserbaseConfigured()) {
    await logAgent(
      insforge,
      userId,
      "Browserbase is not configured — skipping browser research.",
      "warning",
      jobId
    );
    return raw;
  }

  let stagehand: Awaited<ReturnType<typeof createStagehand>> | null = null;
  try {
    const session = await createBrowserbaseSession(120);
    await logAgent(insforge, userId, `Opened Browserbase session ${session.id}`, "info", jobId);
    stagehand = await createStagehand(session.id);
    const page = stagehand.context.pages()[0] ?? (await stagehand.context.newPage());

    // Homepage
    try {
      await page.goto(homepageUrl, { waitUntil: "domcontentloaded", timeoutMs: 30000 });
      raw.homepage = await stagehand.extract(
        "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
        homepageSchema
      );
      await logAgent(insforge, userId, `Extracted homepage: ${homepageUrl}`, "info", jobId);
    } catch (err: any) {
      await logAgent(
        insforge,
        userId,
        `Homepage extraction failed for ${homepageUrl}: ${err?.message || err}`,
        "warning",
        jobId
      );
    }

    if (
      !raw.homepage ||
      (!raw.homepage.oneLiner?.trim() && !raw.homepage.productSummary?.trim())
    ) {
      await logAgent(
        insforge,
        userId,
        "Homepage returned no meaningful content — skipping sub-page research.",
        "warning",
        jobId
      );
      return raw;
    }

    // Sub-pages (max 3)
    const subPageTargets = selectSubPageLinks(homepageUrl, raw.homepage.pageLinks || []);
    for (const target of subPageTargets) {
      try {
        await page.goto(target.url, { waitUntil: "domcontentloaded", timeoutMs: 30000 });
        const content = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
          subPageSchema
        );
        raw.subPages.push({ url: target.url, kind: target.kind, content });
        await logAgent(insforge, userId, `Extracted sub-page (${target.kind}): ${target.url}`, "info", jobId);
      } catch (err: any) {
        await logAgent(
          insforge,
          userId,
          `Sub-page extraction failed for ${target.url}: ${err?.message || err}`,
          "warning",
          jobId
        );
      }
    }
  } catch (err: any) {
    await logAgent(
      insforge,
      userId,
      `Browser research crashed: ${err?.message || err}`,
      "error",
      jobId
    );
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch {
        /* ignore close errors */
      }
    }
  }

  return raw;
}

async function synthesizeDossier(
  companyResearch: CompanyResearchRaw,
  job: any,
  profile: any
): Promise<Omit<CompanyDossier, "sources">> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured on the server.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstruction = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
  funding, customers, headcount, or facts. If research was thin, infer carefully from
  the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: dossierSchema as any,
      temperature: 0.4,
    },
  });

  const candidate = {
    current_title: profile.current_title,
    years_experience: profile.years_experience,
    experience_level: profile.experience_level,
    skills: profile.skills || [],
    work_experience: profile.work_experience || [],
  };

  const userPrompt = `COMPANY RESEARCH (from their website): ${JSON.stringify(companyResearch, null, 2)}
JOB POSTING: ${JSON.stringify(
    {
      title: job.title,
      company: job.company,
      description: job.about_role,
      matched_skills: job.matched_skills || [],
      missing_skills: job.missing_skills || [],
    },
    null,
    2
  )}
CANDIDATE PROFILE: ${JSON.stringify(candidate, null, 2)}`;

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  return JSON.parse(text);
}

export async function runCompanyResearch(jobId: string, userId: string): Promise<CompanyDossier> {
  const insforge = await createInsforgeServer();

  const { data: job, error: jobError } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (jobError || !job) {
    throw new Error(`Job ${jobId} not found for user ${userId}.`);
  }

  // Idempotency — never re-run if a dossier already exists
  if (job.company_research) {
    return job.company_research as CompanyDossier;
  }

  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(`Profile not found for user ${userId}.`);
  }

  await logAgent(
    insforge,
    userId,
    `Starting company research for "${job.company}" (job ${jobId})`,
    "info",
    jobId
  );

  const homepageUrl = await deriveHomepageUrl(
    job.source_url || job.external_apply_url,
    job.company
  );
  if (homepageUrl) {
    await logAgent(insforge, userId, `Derived homepage URL: ${homepageUrl}`, "info", jobId);
  } else {
    await logAgent(
      insforge,
      userId,
      "Could not derive a homepage URL — synthesizing from job posting and profile only.",
      "warning",
      jobId
    );
  }

  const research = homepageUrl
    ? await runBrowserResearch(homepageUrl, userId, jobId, insforge)
    : { homepage: null, subPages: [] };

  const sources: string[] = [];
  if (research.homepage && homepageUrl) sources.push(homepageUrl);
  for (const sp of research.subPages) sources.push(sp.url);

  const synthesized = await synthesizeDossier(research, job, profile);
  const dossier: CompanyDossier = { ...synthesized, sources };

  const { error: saveError } = await insforge.database
    .from("jobs")
    .update({ company_research: dossier })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (saveError) {
    throw new Error(`Failed to save company_research: ${saveError.message}`);
  }

  await logAgent(
    insforge,
    userId,
    `Company research complete for "${job.company}" — ${sources.length} source page(s).`,
    "success",
    jobId
  );

  return dossier;
}
