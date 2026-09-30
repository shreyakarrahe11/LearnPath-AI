"use client";




import React, { useEffect, useState } from "react";
import BasicInfo from "./_components/BasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";

import LoadingDialog from "../_components/LoadingDialog";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

function CourseLayout({ params }) {

  const [course, setCourse] = useState([]); // course is the state variable initially set to an empty array [].
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (params) {
      GetCourse();
    }
  }, [params?.courseId]);


  const GetCourse = async () => {
    try { setCourse(await api(`/courses/${params.courseId}`)); }
    catch (error) { alert(error.message); }
  };

  const GenerateChapterContent = async () => {
    setLoading(true);
    try {
      await api(`/courses/${course.courseId}/generate`, { method: "POST" });
      router.replace(`/create-course/${course.courseId}/finish`);
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl">Course Layout</h2>
      {/* Basic Info  */}
      <BasicInfo course={course} refreshData={() => GetCourse()} edit={true}/>
      {/* Course Detail  */}
      <CourseDetail course={course} />
      {/* List of Lesson  */}
      <ChapterList
        course={course}
        refreshData={() => GetCourse()}
        edit={true}
      />
      <LoadingDialog loading={loading} />
      <Button onClick={GenerateChapterContent} className="my-10">
        Finish
      </Button>
    </div>
  );
  // When refreshData(true) is called, it doesn’t pass true to GetCourse.
  //Instead, it just triggers the function GetCourse to execute.
}

export default CourseLayout;

// Initial Data Fetch with GetCourse:

// CourseLayout calls GetCourse on component mount.
// GetCourse retrieves the latest course data from the database and stores it in result.
// result is then used to update the course state via setCourse.
// This course state is passed down to BasicInfo, CourseDetail, and ChapterList components, allowing them to display the latest course information on the UI.
// Data Display in ChapterList:

// ChapterList receives course as a prop, and it uses this data to display course chapters and other details on the UI.
// Editing a Chapter with EditChapterList:

// When the user clicks “edit” in ChapterList, the EditChapterList component opens.
// EditChapterList uses local states like name and description to hold any updated values entered by the user for the chapter name and description.
// Each change the user makes in the input fields triggers the onChange events, updating name and description accordingly.
// Updating the Database in onUpdateHandler:

// When the user clicks “Update” in EditChapterList, onUpdateHandler updates the courseOutput in the CourseList table in the database.
// The modified courseOutput (which now includes the updated chapter information) is saved to the database.
// refreshData(true) is called to signal that GetCourse should fetch the latest data.
// Data Refresh in CourseLayout:

// refreshData triggers GetCourse, which retrieves the updated course data.
// setCourse then updates the course state in CourseLayout, reflecting the latest database changes.
// Because course has changed, CourseLayout re-renders, and the latest course data is passed again to BasicInfo, CourseDetail, and ChapterList.
// UI Re-render with Updated Data:

// BasicInfo, CourseDetail, and ChapterList automatically re-render with the latest course data, displaying the updated chapter information on the UI.
