import { db } from "@/configs/Db";
import { CourseList, Chapters } from "@/configs/Schema";
import { eq } from "drizzle-orm";
import { identity, findCourse, canEdit, failure } from "@/lib/server-course";
import { generateLesson } from "@/lib/generate-lesson";

export async function POST(_request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!canEdit(course, await identity())) return Response.json({ error: "Not allowed" }, { status: 403 });
    const chapters = course.courseOutput?.course?.chapters;
    if (!Array.isArray(chapters) || !chapters.length) return Response.json({ error: "No chapters found" }, { status: 400 });
    // Preserve the existing published content if a retry fails midway.
    const generated = [];
    for (const chapter of chapters) {
      const content = await generateLesson(course, chapter);
      generated.push(content);
    }
    await db.transaction(async (tx) => {
      await tx.delete(Chapters).where(eq(Chapters.courseId, course.courseId));
      await tx.insert(Chapters).values(generated.map((content, chapterId) => ({ courseId: course.courseId, chapterId, content, videoId: "" })));
      await tx.update(CourseList).set({ publish: true }).where(eq(CourseList.id, course.id));
    });
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
