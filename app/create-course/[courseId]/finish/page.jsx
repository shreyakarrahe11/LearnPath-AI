"use client";
import { api } from "@/lib/api-client";;




import React, { useEffect, useState } from "react";
import BasicInfo from "../_components/BasicInfo";
import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";

function FinishScreen({ params }) {
  //The course ID is passed as a parameter from the router.

  const [course, setCourse] = useState([]);
  useEffect(() => {
    params && GetCourse(); //if params (course ID) exists, then call GetCourse()
  }, [params?.courseId]);

  const GetCourse = async () => {
    try { setCourse(await api(`/courses/${params.courseId}`)); }
    catch (error) { alert(error.message); }
  };

  return (
    <div className="px-10 md:px-20 lg:px-44 my-7">
      <h2 className="text-center font-bold text-2xl my-3 text-primary">
        Congratulations! Your Course is Now Live and Ready to Shine!
      </h2>

      <BasicInfo course={course} refreshData={() => console.log()} edit = {false} />
      <h2 className="mt-3">Course URL:</h2>
      <h2 className="text-center text-gray-500 border p-2 round flex gap-5 items-center shadow-md">
        {typeof window !== "undefined" ? window.location.origin : ""}/course/{course?.courseId}
        <HiOutlineClipboardDocumentCheck
          className="h-5 w-5 cursor-pointer"
          onClick={async () =>
            await navigator.clipboard.writeText(
              window.location.origin + "/course/" + course?.courseId
            )
          } //on click, write the course URL to the clipboard
        />
      </h2>
    </div>
  );
}

export default FinishScreen;
