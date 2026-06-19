"use client";

import { EducationHub } from "../components/EducationHub";
import Chatbot from "../components/Chatbot";

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black">
      <Chatbot currentPage="courses" />
      <div className="pt-24 pb-12"> {/* Adds space below navbar */}
        <EducationHub />
      </div>
    </div>
  );
}
