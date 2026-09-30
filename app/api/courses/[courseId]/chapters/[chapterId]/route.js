import { db } from "@/configs/Db";
import { Chapters } from "@/configs/Schema";
import { and, eq } from "drizzle-orm";
import { findCourse, identity, canEdit, failure } from "@/lib/server-course";
import { generateLesson } from "@/lib/generate-lesson";
import { CourseList } from "@/configs/Schema";
import { normalizeLesson } from "@/lib/lesson";
export async function GET(_request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!course || !canEdit(course, await identity())) return Response.json({ error: "Course not available" }, { status: 404 });
    const [chapter] = await db.select().from(Chapters).where(and(eq(Chapters.courseId, course.courseId), eq(Chapters.chapterId, Number(params.chapterId)))).limit(1);
    if (!chapter) return Response.json({ error: "Chapter not found" }, { status: 404 });
    try { return Response.json({ ...chapter, content: normalizeLesson(chapter.content) }); }
    catch { return Response.json({ error: "Chapter content is empty" }, { status: 404 }); }
  } catch (error) { return failure(error); }
}

export async function POST(_request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!canEdit(course, await identity())) return Response.json({ error: "Not allowed" }, { status: 403 });
    const chapterId = Number(params.chapterId);
    const chapterLayout = course.courseOutput?.course?.chapters?.[chapterId];
    if (!Number.isInteger(chapterId) || chapterId < 0 || !chapterLayout) return Response.json({ error: "Chapter not found" }, { status: 404 });
    const content = await generateLesson(course, chapterLayout);
    const [existing] = await db.select().from(Chapters).where(and(eq(Chapters.courseId, course.courseId), eq(Chapters.chapterId, chapterId))).limit(1);
    let result;
    if (existing) {
      [result] = await db.update(Chapters).set({ content }).where(eq(Chapters.id, existing.id)).returning();
    } else {
      [result] = await db.insert(Chapters).values({ courseId: course.courseId, chapterId, content, videoId: "" }).returning();
    }
    await db.update(CourseList).set({ publish: true }).where(eq(CourseList.id, course.id));
    return Response.json(result);
  } catch (error) { return failure(error, "Chapter generation"); }
}
