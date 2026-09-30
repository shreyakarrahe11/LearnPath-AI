import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/Db";
import { CourseList, AppOwner } from "@/configs/Schema";
import { eq } from "drizzle-orm";

export async function identity() {
  const { userId } = auth();
  if (!userId) return null;
  // One account per database. Claim is atomic if two accounts arrive together.
  await db.insert(AppOwner).values({ id: 1, clerkUserId: userId }).onConflictDoNothing();
  const [owner] = await db.select().from(AppOwner).limit(1);
  if (owner?.clerkUserId !== userId) return null;
  const user = await currentUser();
  return { id: userId, name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Learner", image: user?.imageUrl || "" };
}
export async function findCourse(courseId) {
  const [course] = await db.select().from(CourseList).where(eq(CourseList.courseId, courseId)).limit(1);
  return course;
}
export function canEdit(course, user) { return !!user && course?.createdBy === user.id; }
export function failure(error, stage = "server") {
  console.error(`[${stage}]`, error);
  const status = Number(error?.status) || 0;
  const code = error?.code;
  const message = String(error?.message || "");
  let hint = "Check the npm run dev terminal for the detailed error.";
  if (code === "28P01") hint = "PostgreSQL rejected the password in DATABASE_URL.";
  else if (code === "3D000") hint = "The database named in DATABASE_URL does not exist.";
  else if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(code)) hint = "Cannot reach PostgreSQL. Check its host, port, and whether the server is running.";
  else if (code === "42P01") hint = "The database tables are missing. Restart with npm run dev so setup can create them.";
  else if (status === 400 || status === 401 || status === 403 || /API_KEY_INVALID|API key not valid/i.test(message)) hint = "Gemini rejected the API request. Check GEMINI_API_KEY and the model available to your key.";
  else if (status === 404 || /model.*not found/i.test(message)) hint = "Gemini could not find this model. Try setting GEMINI_MODEL to a model available to your key.";
  else if (status === 429 || /RESOURCE_EXHAUSTED|quota exceeded/i.test(message)) hint = "Gemini quota or rate limit was reached. Check your API usage and retry later.";
  else if (status === 503) hint = "Gemini is temporarily unavailable. Retry shortly.";
  else if (/Invalid course output|Invalid lesson output|JSON/i.test(message)) hint = "Gemini returned an unexpected response. Retry the generation.";
  return Response.json({ error: `${stage}: ${hint}` }, { status: 500 });
}
