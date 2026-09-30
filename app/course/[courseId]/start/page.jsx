"use client";
import { api } from "@/lib/api-client";
import React, { useEffect, useRef, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import { useRouter } from "next/navigation";

function CourseStart({ params }) {
  const [course, setCourse] = useState();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [chapterContent, setChapterContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await api(`/courses/${params.courseId}`);
        if (cancelled) return;
        setCourse(result);
        const first = result.courseOutput?.course?.chapters?.[0];
        if (first) { setSelectedChapter(first); await loadChapter(0); }
        else { setLoading(false); setError("This course has no chapters."); }
      } catch (cause) { if (!cancelled) { setLoading(false); setError(cause.message); } }
    };
    load();
    return () => { cancelled = true; requestId.current += 1; };
  }, [params.courseId]);

  const loadChapter = async (index) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setChapterContent(null);
    setSelectedIndex(index);
    try {
      let result;
      try { result = await api(`/courses/${params.courseId}/chapters/${index}`); }
      catch (cause) {
        if (!/Chapter not found|content is empty/i.test(cause.message)) throw cause;
        result = await api(`/courses/${params.courseId}/chapters/${index}`, { method: "POST" });
      }
      if (requestId.current === currentRequest) setChapterContent(result);
    } catch (cause) { if (requestId.current === currentRequest) setError(cause.message); }
    finally { if (requestId.current === currentRequest) setLoading(false); }
  };

  return (
    <div>
      <div className="fixed md:w-72 hidden md:block h-screen border-r shadow-lg">
        <h2 className="font-medium text-lg bg-primary p-4 text-white">{course?.courseOutput?.course?.name}</h2>
        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          {course?.courseOutput?.course?.chapters?.map((chapter, index) => (
            <div key={index} className={`cursor-pointer hover:bg-[#e8e4e3] ${selectedIndex === index ? "bg-[#e8e4e3]" : ""}`}
              onClick={() => { setSelectedChapter(chapter); loadChapter(index); }}>
              <ChapterListCard chapter={chapter} index={index} />
            </div>
          ))}
        </div>
      </div>
      <div className="md:ml-72">
        <ChapterContent chapter={selectedChapter} content={chapterContent} includeVideo={course?.includeVideo} />
        {loading && <p className="px-10 pb-8 text-gray-600">Loading lesson content...</p>}
        {error && <div className="mx-10 mb-8 rounded-lg border border-red-200 p-4 text-red-700">
          <p>{error}</p>
          {selectedChapter && <button className="mt-2 underline" onClick={() => loadChapter(selectedIndex)}>Retry this lesson</button>}
        </div>}
        <button onClick={() => router.push("/dashboard")} className="w-full p-4 bg-primary text-white hover:bg-primary/90 transition-colors">Back to Dashboard</button>
      </div>
    </div>
  );
}
export default CourseStart;
