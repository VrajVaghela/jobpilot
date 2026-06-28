"use client";

import React, { useState, useMemo } from "react";
import { CompletionIndicator } from "./CompletionIndicator";
import { ResumeUpload } from "./ResumeUpload";
import { ResumePreview } from "./ResumePreview";
import { ProfileForm, ProfileData } from "./ProfileForm";

interface ProfileClientProps {
  userEmail: string;
}

export function ProfileClient({ userEmail }: ProfileClientProps) {
  // Initialize profile form state with mock data from designs/profile.png
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "Faizan Ali",
    email: userEmail || "faizan@jsmastery.pro",
    phone: "", // Missing -> Triggers Needs Attention
    location: "", // Missing -> Triggers Needs Attention
    linkedin_url: "https://linkedin.com/in/faizan",
    portfolio_url: "https://github.com/jsmastery",
    work_authorization: "citizen",
    current_title: "Frontend Engineer",
    experience_level: "junior",
    years_experience: "4",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    industries: [],
    work_experience: [
      {
        id: "vrc-1",
        company: "Vercel",
        title: "Frontend Engineer",
        start_date: "January 2022",
        end_date: "",
        currently_working: true,
        responsibilities: "Built Next.js features and optimized web vitals. Led a team of 3 developers.",
      },
    ],
    education: {
      highest_degree: "high_school",
      field_of_study: "Computer Science",
      institution: "", // Missing -> Triggers Needs Attention
      graduation_year: "", // Missing -> Triggers Needs Attention
    },
    job_titles_seeking: "Frontend Engineer, React Developer",
    remote_preference: "any",
    salary_expectation: "",
    preferred_locations: "",
  });

  // Mock resume upload state
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string } | null>(null);

  // Success alert visibility
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Completion percentage and missing tags calculation
  const { percent, missingFields } = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    // Personal Info (Total 35%)
    if (profile.full_name) score += 5;
    if (profile.email) score += 5;
    if (profile.phone) {
      score += 10;
    } else {
      missing.push("PHONE");
    }
    if (profile.location) {
      score += 10;
    } else {
      missing.push("LOCATION");
    }
    if (profile.linkedin_url || profile.portfolio_url) score += 5;

    // Professional Info & Preferences (Total 30%)
    if (profile.work_authorization) score += 5;
    if (profile.current_title) score += 5;
    if (profile.experience_level && profile.years_experience !== "") score += 5;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.remote_preference) score += 5;

    // Work Experience (Total 10%)
    const hasValidWorkExp =
      profile.work_experience.length > 0 &&
      profile.work_experience.some((exp) => exp.company && exp.title);
    if (hasValidWorkExp) score += 10;

    // Education (Total 25%)
    if (profile.education.highest_degree) score += 5;
    if (profile.education.field_of_study) score += 5;

    const hasSchool = !!profile.education.institution;
    const hasYear = !!profile.education.graduation_year;

    if (hasSchool) score += 5;
    if (hasYear) score += 5;

    if (!hasSchool || !hasYear) {
      missing.push("EDUCATION");
    }

    if (profile.job_titles_seeking) score += 5;

    return { percent: score, missingFields: missing };
  }, [profile]);

  const handleUploadSimulated = (fileName: string, fileSize: string) => {
    setResumeFile({ name: fileName, size: fileSize });
  };

  const handleGenerateSimulated = () => {
    // Generate a mock resume from profile data
    setResumeFile({
      name: `${profile.full_name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`,
      size: "1.2 MB",
    });
  };

  const handleSave = () => {
    setSaveSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="mb-6 rounded-lg border border-success-alt bg-success-lightest p-4 text-sm text-success-foreground font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <svg
            className="h-5 w-5 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Profile settings saved successfully (Local Mock State)!
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Card 1: Completion Indicator */}
        <CompletionIndicator percent={percent} missingFields={missingFields} />

        {/* Card 2: Resume Manager */}
        {resumeFile ? (
          <ResumePreview
            fileName={resumeFile.name}
            fileSize={resumeFile.size}
            onRemove={() => setResumeFile(null)}
            profileData={profile}
          />
        ) : (
          <ResumeUpload
            onUploadSimulated={handleUploadSimulated}
            onGenerateSimulated={handleGenerateSimulated}
          />
        )}

        {/* Card 3: Main Profile Form */}
        <ProfileForm initialData={profile} onChange={setProfile} onSave={handleSave} />
      </div>
    </div>
  );
}
