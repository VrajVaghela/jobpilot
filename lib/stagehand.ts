import { Stagehand } from "@browserbasehq/stagehand";

export async function createStagehand(browserbaseSessionID: string) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const bbKey = process.env.BROWSERBASE_API_KEY;
  if (!openaiKey) throw new Error("OPENAI_API_KEY is not configured.");
  if (!bbKey) throw new Error("BROWSERBASE_API_KEY is not configured.");

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: bbKey,
    browserbaseSessionID,
    model: {
      modelName: "openai/gpt-4o",
      apiKey: openaiKey,
    },
  });

  await stagehand.init();
  return stagehand;
}
