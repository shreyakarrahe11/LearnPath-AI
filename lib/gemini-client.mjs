import { GoogleGenerativeAI } from "@google/generative-ai";

let selectedModel;
let modelList;

function rank(name) {
  if (/^gemini-3\.8-flash$/.test(name)) return 0;
  if (/^gemini-3\.5-flash-lite$/.test(name)) return 1;
  if (/^gemini-3\.6-flash$/.test(name)) return 2;
  if (/^gemini-3\.1-flash-lite$/.test(name)) return 3;
  if (/^gemini-2\.5-flash$/.test(name)) return 4;
  return /flash/i.test(name) ? 10 : 20;
}

export async function availableGeminiModels(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  if (!modelList) modelList = (async () => {
    const names = [];
    let pageToken;
    do {
      const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
      url.searchParams.set("pageSize", "1000");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const response = await fetch(url, { headers: { "x-goog-api-key": apiKey }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error("Could not list Gemini models for this key");
        error.status = response.status;
        throw error;
      }
      for (const model of data.models || []) {
        const name = String(model.name || "").replace(/^models\//, "");
        if (model.supportedGenerationMethods?.includes("generateContent") &&
            /^gemini-/.test(name) && !/(image|audio|tts|live|embedding|robotics)/i.test(name)) names.push(name);
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
    if (!names.length) throw new Error("No Gemini text-generation model is available to this API key");
    const preferred = process.env.GEMINI_MODEL?.trim();
    return [...new Set(names)].sort((a, b) =>
      (a === preferred ? -100 : rank(a)) - (b === preferred ? -100 : rank(b)) || a.localeCompare(b));
  })().catch(error => { modelList = undefined; throw error; });
  return modelList;
}

export async function runGemini(prompt, generationConfig = {}, apiKey = process.env.GEMINI_API_KEY) {
  const names = await availableGeminiModels(apiKey);
  const candidates = selectedModel && names.includes(selectedModel)
    ? [selectedModel, ...names.filter(name => name !== selectedModel)] : names;
  const genAI = new GoogleGenerativeAI(apiKey);
  let notFound;
  for (const name of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: name, generationConfig });
      const result = await model.generateContent(prompt);
      selectedModel = name;
      return { text: result.response.text(), model: name };
    } catch (error) {
      // Some newly issued keys can list a model that still rejects generation.
      const status = Number(error.status) || Number(String(error.message).match(/\[(\d{3}) /)?.[1]);
      if (status !== 404) throw error;
      notFound = error;
      if (selectedModel === name) selectedModel = undefined;
    }
  }
  throw notFound || new Error("No listed Gemini model accepted generation");
}
