export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1";
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
}

/**
 * Maps a location text search input to a supported Adzuna country code.
 */
export function detectCountry(location: string): string {
  if (!location) return "us";
  const loc = location.toLowerCase().trim();
  
  if (loc.includes("united kingdom") || loc.includes(" uk") || loc === "uk" || loc.includes("london") || loc.includes("gb")) {
    return "gb";
  }
  if (loc.includes("canada") || loc.includes(" ca") || loc === "ca" || loc.includes("toronto") || loc.includes("vancouver")) {
    return "ca";
  }
  if (loc.includes("australia") || loc.includes(" au") || loc === "au" || loc.includes("sydney") || loc.includes("melbourne")) {
    return "au";
  }
  if (loc.includes("new zealand") || loc.includes(" nz") || loc === "nz" || loc.includes("auckland")) {
    return "nz";
  }
  if (loc.includes("south africa") || loc.includes(" za") || loc === "za" || loc.includes("johannesburg")) {
    return "za";
  }
  if (loc.includes("india") || loc.includes(" in") || loc === "in" || loc.includes("mumbai") || loc.includes("bangalore") || loc.includes("bengaluru")) {
    return "in";
  }
  
  return "us";
}

/**
 * Performs a job search via the Adzuna API.
 */
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us"
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials (ADZUNA_APP_ID/ADZUNA_APP_KEY) are not configured.");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided and not "remote"
  const normalizedLoc = location?.toLowerCase().trim();
  if (normalizedLoc && normalizedLoc !== "remote") {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
  );

  if (!response.ok) {
    throw new Error(`Adzuna API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
