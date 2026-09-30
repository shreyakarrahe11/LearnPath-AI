import { db } from "@/configs/Db";
import { CourseList } from "@/configs/Schema";
import { eq } from "drizzle-orm";
import { identity, findCourse, canEdit, failure } from "@/lib/server-course";
export async function POST(request, { params }) {
  try {
    const course = await findCourse(params.courseId);
    if (!canEdit(course, await identity())) return Response.json({ error: "Not allowed" }, { status: 403 });
    const file = (await request.formData()).get("file");
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1024 * 1024) return Response.json({ error: "Select a JPG, PNG, or WebP image under 1 MB" }, { status: 400 });
    const banner = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
    await db.update(CourseList).set({ courseBanner: banner }).where(eq(CourseList.id, course.id));
    return Response.json({ banner });
  } catch (error) { return failure(error); }
}
