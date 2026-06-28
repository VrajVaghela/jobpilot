"use client";

import React, { useState, useMemo } from "react";
import { CompletionIndicator } from "./CompletionIndicator";
import { ResumeUpload } from "./ResumeUpload";
import { ResumePreview } from "./ResumePreview";
import { ProfileForm } from "./ProfileForm";
import { ProfileData, saveProfile, uploadResume, deleteResume } from "@/actions/profile";

interface ProfileClientProps {
  userEmail: string;
  initialProfile: ProfileData;
  initialResumePdfUrl: string | null;
}

export function ProfileClient({ userEmail, initialProfile, initialResumePdfUrl }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // Initialize resume file state from database URL if it exists
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string; url?: string | null } | null>(() => {
    if (initialResumePdfUrl) {
      let name = "resume.pdf";
      try {
        const decoded = decodeURIComponent(initialResumePdfUrl);
        const parts = decoded.split("/");
        name = parts[parts.length - 1] || "resume.pdf";
      } catch (e) {}
      return { name, size: "Uploaded PDF", url: initialResumePdfUrl };
    }
    return null;
  });

  // Action loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadResume(formData);
      if (res.success && res.url) {
        setResumeFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: res.url,
        });
      } else {
        setErrorMessage(res.error || "Failed to upload resume.");
      }
    } catch (err) {
      console.error("[handleUpload] Error uploading resume:", err);
      setErrorMessage("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await deleteResume();
      if (res.success) {
        setResumeFile(null);
      } else {
        setErrorMessage(res.error || "Failed to delete resume.");
      }
    } catch (err) {
      console.error("[handleRemoveResume] Error deleting resume:", err);
      setErrorMessage("An unexpected error occurred while deleting the resume.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateSimulated = () => {
    // Generate a mock resume from profile data
    setResumeFile({
      name: `${profile.full_name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`,
      size: "1.2 MB",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const res = await saveProfile(profile);
      if (res.success) {
        setSaveSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(res.error || "Failed to save profile settings.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("[handleSave] Error saving profile:", err);
      setErrorMessage("An unexpected error occurred while saving your profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSaving(false);
    }
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
          Profile settings saved successfully!
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-error bg-red-50 p-4 text-sm text-red-700 font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {errorMessage}
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
            url={resumeFile.url}
            onRemove={handleRemoveResume}
            isDeleting={isDeleting}
            profileData={profile}
          />
        ) : (
          <ResumeUpload
            onUpload={handleUpload}
            isUploading={isUploading}
            onGenerateSimulated={handleGenerateSimulated}
          />
        )}

        {/* Card 3: Main Profile Form */}
        <ProfileForm 
          initialData={profile} 
          onChange={setProfile} 
          onSave={handleSave} 
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

