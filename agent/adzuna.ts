import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createInsforgeServer } from "@/lib/insforge-server";
import { searchJobs, detectCountry, AdzunaJob } from "@/lib/adzuna";

// Define the schema for the Gemini match response
const matchSchema = {
  type: SchemaType.OBJECT,
  properties: {
    matchScore: { 
      type: SchemaType.INTEGER, 
      description: "Match score between 0 and 100 indicating how well the candidate profile matches the job requirements." 
    },
    matchReason: { 
      type: SchemaType.STRING, 
      description: "A single paragraph explaining the reason behind the score and how the candidate's skills and experience match or do not match the job requirements." 
    },
    matchedSkills: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "List of skills from the candidate's profile that are relevant to or required by the job." 
    },
    missingSkills: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "List of key skills that the job requires or implies but are missing from the candidate's profile." 
    }
  },
  required: ["matchScore", "matchReason", "matchedSkills", "missingSkills"]
};

/**
 * Helper to log steps to the agent_logs table.
 */
async function logAgent(
  insforge: any,
  runId: string,
  userId: string,
  message: string,
  level: "info" | "success" | "warning" | "error" = "info",
  jobId?: string
) {
  console.log(`[Agent Log - ${level.toUpperCase()}]: ${message}`);
  try {
    await insforge.database.from("agent_logs").insert({
      run_id: runId,
      user_id: userId,
      message,
      level,
      job_id: jobId || null,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to write to agent_logs:", err);
  }
}

/**
 * Invokes Gemini 2.5 Flash to score a single job listing against a candidate's profile.
 */
async function scoreJob(
  genAI: GoogleGenerativeAI,
  profile: any,
  job: AdzunaJob
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: matchSchema as any,
    },
  });

  const prompt = `You are a professional recruiting and career agent. Analyze the following candidate profile and job listing.
Calculate a match score between 0 and 100 (where 0 means no match and 100 means perfect match) indicating how well the candidate fits the job.
Detail why the candidate matches or doesn't match in a single paragraph.
List the skills the candidate has that match the job requirements in "matchedSkills".
List the skills the job requires or implies that are missing from the candidate's profile in "missingSkills".

CANDIDATE PROFILE:
Name: ${profile.full_name || "Candidate"}
Current Title: ${profile.current_title || "Not specified"}
Experience Level: ${profile.experience_level || "Not specified"} (${profile.years_experience || 0} years)
Skills: ${(profile.skills || []).join(", ")}
Industries: ${(profile.industries || []).join(", ")}
Job Titles Seeking: ${(profile.job_titles_seeking || []).join(", ")}
Remote Preference: ${profile.remote_preference || "Not specified"}

JOB LISTING:
Title: ${job.title}
Company: ${job.company?.display_name || "Not specified"}
Location: ${job.location?.display_name || "Not specified"}
Description snippet: ${job.description}
Estimated Salary: ${job.salary_min ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k` : "Not specified"}

Return ONLY valid JSON matching the schema.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

/**
 * Main discovery function for finding and scoring jobs from the Adzuna API.
 */
export async function runJobDiscovery(
  userId: string,
  jobTitle: string,
  location: string
) {
  const insforge = await createInsforgeServer();

  // 1. Fetch user profile
  const { data: profile, error: profileError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(`Profile not found for user: ${userId}. Error: ${profileError?.message || "none"}`);
  }

  // 2. Initialize Agent Run record
  const { data: run, error: runError } = await insforge.database
    .from("agent_runs")
    .insert({
      user_id: userId,
      status: "running",
      job_title_searched: jobTitle,
      location_searched: location,
      jobs_found: 0,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (runError || !run) {
    throw new Error(`Failed to create agent_run record: ${runError?.message || "none"}`);
  }

  const runId = run.id;

  try {
    await logAgent(insforge, runId, userId, `Starting job discovery for "${jobTitle}" in "${location || "Remote"}"`, "info");

    // 3. Call Adzuna search client
    const country = detectCountry(location);
    await logAgent(insforge, runId, userId, `Querying Adzuna API for country: ${country}`, "info");

    let adzunaJobs: AdzunaJob[] = [];
    try {
      adzunaJobs = await searchJobs(jobTitle, location, country);
      await logAgent(insforge, runId, userId, `Adzuna returned ${adzunaJobs.length} job listings`, "info");
    } catch (apiErr: any) {
      await logAgent(insforge, runId, userId, `Adzuna API query failed: ${apiErr.message}`, "error");
      throw apiErr;
    }

    if (adzunaJobs.length === 0) {
      await logAgent(insforge, runId, userId, "No jobs returned by Adzuna. Discovery run finished.", "success");
      await insforge.database
        .from("agent_runs")
        .update({
          status: "completed",
          jobs_found: 0,
          completed_at: new Date().toISOString()
        })
        .eq("id", runId);
      return { totalFound: 0, matchesSaved: 0 };
    }

    // 4. Batch match/scoring process using Gemini (concurrency limit = 3)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API_KEY;
    if (!apiKey) {
      const keyErr = new Error("Gemini API key is not configured on the server.");
      await logAgent(insforge, runId, userId, keyErr.message, "error");
      throw keyErr;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let matchedCount = 0;

    const batchSize = 3;
    for (let i = 0; i < adzunaJobs.length; i += batchSize) {
      const chunk = adzunaJobs.slice(i, i + batchSize);
      await Promise.all(
        chunk.map(async (job) => {
          let scoredJob = {
            matchScore: 0,
            matchReason: "Error occurred during matching.",
            matchedSkills: [] as string[],
            missingSkills: [] as string[]
          };

          try {
            const result = await scoreJob(genAI, profile, job);
            if (result && typeof result.matchScore === "number") {
              scoredJob = {
                matchScore: result.matchScore,
                matchReason: result.matchReason || "No explanation provided.",
                matchedSkills: result.matchedSkills || [],
                missingSkills: result.missingSkills || []
              };
            }
          } catch (geminiErr: any) {
            console.error(`Gemini scoring failed for job ${job.id || job.title}:`, geminiErr);
            await logAgent(
              insforge,
              runId,
              userId,
              `Gemini scoring failed for job "${job.title}" at "${job.company?.display_name || "Unknown"}": ${geminiErr.message}`,
              "warning"
            );
          }

          // Map and save to jobs table
          const jobRecord = {
            user_id: userId,
            run_id: runId,
            source: "search",
            source_url: job.redirect_url,
            external_apply_url: job.redirect_url,
            title: job.title,
            company: job.company?.display_name || "Unknown Company",
            location: job.location?.display_name || location || "Remote",
            salary: job.salary_min
              ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
              : null,
            job_type: job.contract_type || "fulltime",
            about_role: job.description || "",
            match_score: scoredJob.matchScore,
            match_reason: scoredJob.matchReason,
            matched_skills: scoredJob.matchedSkills,
            missing_skills: scoredJob.missingSkills,
            found_at: new Date().toISOString()
          };

          const { data: savedJob, error: saveError } = await insforge.database
            .from("jobs")
            .insert(jobRecord)
            .select()
            .single();

          if (saveError) {
            console.error("Failed to save job to DB:", saveError);
            await logAgent(
              insforge,
              runId,
              userId,
              `Failed to save job "${job.title}" to DB: ${saveError.message}`,
              "warning"
            );
          } else {
            matchedCount++;
            await logAgent(
              insforge,
              runId,
              userId,
              `Discovered and saved job match: "${job.title}" at "${jobRecord.company}" (Score: ${scoredJob.matchScore}%)`,
              "info",
              savedJob.id
            );
          }
        })
      );
    }

    // 5. Complete Agent Run record successfully
    await logAgent(insforge, runId, userId, `Job discovery complete. Found ${adzunaJobs.length} jobs, saved ${matchedCount} matching records.`, "success");
    
    await insforge.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: adzunaJobs.length,
        completed_at: new Date().toISOString()
      })
      .eq("id", runId);

    return { totalFound: adzunaJobs.length, matchesSaved: matchedCount };
  } catch (err: any) {
    console.error("Agent Job Discovery run crashed:", err);
    await logAgent(insforge, runId, userId, `Job discovery run crashed: ${err.message}`, "error");

    await insforge.database
      .from("agent_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString()
      })
      .eq("id", runId);

    throw err;
  }
}
