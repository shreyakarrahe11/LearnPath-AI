"use client";
import { api } from "@/lib/api-client";
import Header from "@/app/dashboard/_components/Header.jsx";
import ChapterList from '@/app/create-course/[courseId]/_components/ChapterList'
import BasicInfo from '@/app/create-course/[courseId]/_components/BasicInfo'
import CourseDetail from '@/app/create-course/[courseId]/_components/CourseDetail'



import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function Course({params}) {
  //params is the parameter passed from the router = the course ID
    const [course,setCourse]=useState();

    useEffect(()=>{
        params&&GetCourse();
    },[params]) //if params (course ID) changes , then call GetCourse

    const GetCourse=async()=>{
        try { setCourse(await api(`/courses/${params.courseId}`)); }
        catch (error) { alert(error.message); }
    }

  return (
    <div>
        <Header/>
        <div className='px-10 p-10 md:px-20 lg:px-44'>
        <BasicInfo course={course} edit={false} />
        <CourseDetail course={course} />
        <ChapterList course={course}  edit={false}/>
        </div>

    </div>
  )
}

export default Course