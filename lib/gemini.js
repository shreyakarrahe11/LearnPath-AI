import "server-only";
import { runGemini } from "@/lib/gemini-client.mjs";

export async function generateJson(prompt) {
  const result = await runGemini(prompt, { responseMimeType: "application/json", temperature: 0.7 });
  const raw = result.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(raw);
}
