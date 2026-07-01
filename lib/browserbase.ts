import Browserbase from "@browserbasehq/sdk";

const apiKey = process.env.BROWSERBASE_API_KEY;
const projectId = process.env.BROWSERBASE_PROJECT_ID;

export function isBrowserbaseConfigured(): boolean {
  return Boolean(apiKey && projectId);
}

export async function createBrowserbaseSession(timeoutSeconds = 120) {
  if (!apiKey || !projectId) {
    throw new Error(
      "Browserbase is not configured. Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID."
    );
  }

  const bb = new Browserbase({ apiKey });
  return await bb.sessions.create({
    projectId,
    // Session expires after this many seconds; one company-research run touches ≤ 4 pages
    timeout: timeoutSeconds,
  });
}
