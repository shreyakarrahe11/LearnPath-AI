// Accept a few common structured-output shapes, but never publish an empty lesson.
export function normalizeLesson(output) {
  const source = Array.isArray(output) ? output
    : output?.sections || output?.lessons || output?.content || output?.chapter?.sections;
  const sections = Array.isArray(source) ? source : typeof source === "string" ? [{ description: source }] : [];
  const normalized = sections.map((item, index) => ({
    title: String(item?.title || item?.heading || item?.name || `Section ${index + 1}`),
    description: String(item?.description || item?.explanation || item?.content || item?.body || item?.text || ""),
    codeExample: String(item?.codeExample || item?.code || ""),
  })).filter(item => item.description.trim().length > 0);
  if (!normalized.length) throw new Error("Gemini returned an empty lesson");
  return normalized;
}
