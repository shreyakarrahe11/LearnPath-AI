import { db } from "@/configs/Db";
import { Chapters, CourseList } from "@/configs/Schema";
import { eq } from "drizzle-orm";
import { identity, findCourse, canEdit, failure } from "@/lib/server-course";

export async function GET(_request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
    if (!canEdit(course, await identity())) return Response.json({ error: "Course not available" }, { status: 403 });
    return Response.json(course);
  } catch (error) { return failure(error); }
}
export async function PATCH(request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!canEdit(course, await identity())) return Response.json({ error: "Not allowed" }, { status: 403 });
    const { courseOutput } = await request.json();
    if (!courseOutput?.course || !Array.isArray(courseOutput.course.chapters)) return Response.json({ error: "Invalid course layout" }, { status: 400 });
    await db.update(CourseList).set({ courseOutput }).where(eq(CourseList.id, course.id));
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
export async function DELETE(_request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!canEdit(course, await identity())) return Response.json({ error: "Not allowed" }, { status: 403 });
    await db.delete(Chapters).where(eq(Chapters.courseId, course.courseId));
    await db.delete(CourseList).where(eq(CourseList.id, course.id));
    return Response.json({ ok: true });
  } catch (error) { return failure(error); }
}
