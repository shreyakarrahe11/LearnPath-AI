import { db } from "@/configs/Db";
import { CourseList } from "@/configs/Schema";
import { desc, eq } from "drizzle-orm";
import { generateJson } from "@/lib/gemini";
import { identity, failure } from "@/lib/server-course";
import { randomUUID } from "node:crypto";

export async function GET(request) {
  try {
    const user = await identity();
    if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
    const url = new URL(request.url);
    const page = Math.max(0, Number.parseInt(url.searchParams.get("page") || "0", 10) || 0);
    const explore = url.searchParams.get("explore") === "1";
    const courses = explore
      ? await db.select().from(CourseList).where(eq(CourseList.createdBy, user.id)).orderBy(desc(CourseList.id)).limit(9).offset(page * 9)
      : await db.select().from(CourseList).where(eq(CourseList.createdBy, user.id)).orderBy(desc(CourseList.id));
    return Response.json(courses);
  } catch (error) { return failure(error); }
}
export async function POST(request) {
  let stage = "PostgreSQL or Clerk";
  try {
    const user = await identity();
    if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
    const input = await request.json();
    if (!input.topic || !input.category || !input.description || !input.noOfChapter) return Response.json({ error: "Complete the course options first" }, { status: 400 });
    const count = Math.min(20, Math.max(1, Number(input.noOfChapter) || 1));
    stage = "Gemini";
    const output = await generateJson(`Generate an accurate learning course in ${input.language || "English"}. Return ONLY JSON shaped {"course":{"name":"...","description":"...","chapters":[{"name":"...","description":"...","duration":"..."}],"numberOfChapters":${count},"prerequisites":"...","language":"...","format":"...","outcome":"..."}}. Exactly ${count} chapters. User requirements: ${JSON.stringify(input)}`);
    if (!output?.course || !Array.isArray(output.course.chapters) || !output.course.chapters.length) throw new Error("Invalid course output");
    const courseId = randomUUID();
    stage = "PostgreSQL";
    await db.insert(CourseList).values({ courseId, description: input.description, name: input.topic, category: input.category, prerequisites: input.prerequisites || "None", duration: input.duration || "Self-paced", noOfChapters: count, format: input.format || "Online", language: input.language || "English", level: input.level || "Beginner", outcomes: input.outcomes || "", includeVideo: input.video === true || input.video === "Yes" ? "Yes" : "No", courseOutput: output, createdBy: user.id, userName: user.name, userProfileImage: user.image, publish: false });
    return Response.json({ courseId }, { status: 201 });
  } catch (error) { return failure(error, stage); }
}
