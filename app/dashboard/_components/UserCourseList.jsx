"use client";
import { api } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { UserCourseListContext } from "@/app/_context/UserCourseListContext";

function UserCourseList() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, isLoaded } = useUser();
  const { setUserCourseList } = useContext(UserCourseListContext);

  useEffect(() => {
    if (isLoaded && user) getUserCourses();
    else if (isLoaded) setLoading(false);
  }, [isLoaded, user?.id]);

  const getUserCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api("/courses");
      setCourseList(result);
      setUserCourseList(result);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="font-medium text-xl">My AI Learning Hub</h2>
      {error ? (
        <div className="mt-5 rounded-lg border p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button className="mt-3 text-primary underline" onClick={getUserCourses}>Retry</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(item => <div key={item} className="w-full mt-5 bg-slate-200 animate-pulse rounded-lg h-[270px]" />)}
        </div>
      ) : courseList.length === 0 ? (
        <div className="mt-5 rounded-lg border p-8 text-center text-gray-600">
          <p>You have not created a course yet.</p>
          <Link href="/create-course" className="mt-3 inline-block text-primary underline">Create your first AI course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {courseList.map(course => <CourseCard course={course} key={course.courseId} refreshData={getUserCourses} />)}
        </div>
      )}
    </div>
  );
}
export default UserCourseList;
