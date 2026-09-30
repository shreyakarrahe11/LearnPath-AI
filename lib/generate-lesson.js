import "server-only";
import { generateJson } from "@/lib/gemini";
import { normalizeLesson } from "@/lib/lesson";

export async function generateLesson(course, chapter) {
  const output = await generateJson(`Create a detailed lesson for a ${course.level} course on ${course.name}. Chapter: ${chapter.name}. Context: ${chapter.description || chapter.about || ""}. Language: ${course.language}. Return ONLY JSON containing 3 to 6 substantial sections. Each section must have a title, a detailed description in Markdown, and codeExample (a code string or empty string). Include concrete worked examples and an exercise. Shape: {"sections":[{"title":"...","description":"...","codeExample":"..."}]}.`);
  return normalizeLesson(output);
}
