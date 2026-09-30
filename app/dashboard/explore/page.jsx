"use client";
import { api } from "@/lib/api-client";;


import React, { useEffect, useState } from "react";
import CourseCard from "../_components/CourseCard";
import { Button } from "@/components/ui/button";

function Explore() {
  const [courseList, setCourseList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    GetAllCourse();
  }, [pageIndex]);

  // This means that whenever pageIndex changes (either increased or decreased by 
  // clicking the "Next Page" or "Previous Page" buttons), useEffect will re-run and call 
  // the GetAllCourse function again.

  const GetAllCourse = async () => {
    try { setCourseList(await api(`/courses?explore=1&page=${pageIndex}`)); }
    catch (error) { alert(error.message); }
  };

  return (
    <div>
      <h2 className="font-bold text-3xl">Explore Courses</h2>
      <p>Explore your generated courses</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {/* // display 9 per page */}
        {courseList?.length > 0
          ? courseList?.map((course, index) => (
              <div>
                <CourseCard course={course} displayUser={true} />
              </div>
            ))
          : <p className="mt-5 text-gray-500">No courses yet. Create a course to see it here.</p>}
      </div>

      <div className="flex justify-between mt-5">
        {pageIndex != 0 && (
          <Button onClick={() => setPageIndex(pageIndex - 1)}>
            Previous Page
          </Button>
        )}
        <Button onClick={() => setPageIndex(pageIndex + 1)}>Next Page</Button>
      </div>
    </div>
  );
}

export default Explore;