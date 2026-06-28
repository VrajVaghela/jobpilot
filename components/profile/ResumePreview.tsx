import React from "react";

interface ResumePreviewProps {
  fileName: string;
  fileSize: string;
  onRemove: () => void;
  profileData: any; // Render dynamic mock content preview based on profile fields
}

export function ResumePreview({ fileName, fileSize, onRemove, profileData }: ResumePreviewProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Resume</h2>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-error hover:underline"
        >
          Remove
        </button>
      </div>

      {/* File Info Block */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface-secondary p-4">
        <div className="flex items-center gap-3">
          {/* PDF Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary truncate max-w-[200px] sm:max-w-[320px]">
              {fileName}
            </p>
            <p className="text-xs text-text-muted">
              {fileSize} • Uploaded on {currentDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary shadow-sm transition-colors"
          onClick={() => alert("Mock PDF download triggered")}
        >
          Download
        </button>
      </div>

      {/* Mock Document Render Container */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-inner">
        <div className="bg-surface-muted px-4 py-2 border-b border-border text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
          Parsed Content Preview
        </div>
        <div className="h-64 overflow-y-auto p-6 font-mono text-xs text-text-dark bg-white leading-relaxed select-none">
          <div className="text-center border-b border-border pb-4">
            <h1 className="text-sm font-bold uppercase tracking-wide text-text-primary">
              {profileData.full_name || "FAIZAN ALI"}
            </h1>
            <p className="text-[10px] text-text-secondary mt-1">
              {profileData.email || "faizan@jsmastery.pro"} {profileData.phone ? `• ${profileData.phone}` : ""}
              {profileData.location ? ` • ${profileData.location}` : ""}
            </p>
            <p className="text-[10px] text-text-secondary">
              {profileData.linkedin_url ? `LinkedIn: ${profileData.linkedin_url}` : ""}
              {profileData.portfolio_url ? ` | Portfolio: ${profileData.portfolio_url}` : ""}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold border-b border-border pb-0.5 text-text-primary uppercase tracking-wide text-[10px]">
              Summary
            </h3>
            <p className="mt-1 text-[11px]">
              Experienced {profileData.current_title || "Frontend Engineer"} ({profileData.experience_level || "Junior"} Level) with {profileData.years_experience || "4"} years of experience.
              Remote preference: {profileData.remote_preference || "Any"}. Work authorization: {profileData.work_authorization || "Citizen"}.
            </p>
          </div>

          {profileData.skills && profileData.skills.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold border-b border-border pb-0.5 text-text-primary uppercase tracking-wide text-[10px]">
                Skills
              </h3>
              <p className="mt-1 text-[11px]">
                {profileData.skills.join(", ")}
              </p>
            </div>
          )}

          {profileData.work_experience && profileData.work_experience.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold border-b border-border pb-0.5 text-text-primary uppercase tracking-wide text-[10px]">
                Experience
              </h3>
              {profileData.work_experience.map((exp: any, index: number) => (
                <div key={exp.id || index} className="mt-2">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span>{exp.company} — {exp.title}</span>
                    <span>
                      {exp.start_date} – {exp.currently_working ? "Present" : exp.end_date}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] whitespace-pre-line text-text-secondary">
                    {exp.responsibilities}
                  </p>
                </div>
              ))}
            </div>
          )}

          {profileData.education && (profileData.education.institution || profileData.education.highest_degree) && (
            <div className="mt-4">
              <h3 className="font-bold border-b border-border pb-0.5 text-text-primary uppercase tracking-wide text-[10px]">
                Education
              </h3>
              <div className="mt-1 flex justify-between text-[11px]">
                <span>
                  {profileData.education.highest_degree} in {profileData.education.field_of_study || "N/A"}
                </span>
                <span>{profileData.education.graduation_year || "N/A"}</span>
              </div>
              {profileData.education.institution && (
                <p className="text-[11px] text-text-secondary">{profileData.education.institution}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
