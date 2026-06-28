import React, { useRef } from "react";

interface ResumeUploadProps {
  onUploadSimulated: (fileName: string, fileSize: string) => void;
  onGenerateSimulated: () => void;
}

export function ResumeUpload({ onUploadSimulated, onGenerateSimulated }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      onUploadSimulated(file.name, `${sizeInMB} MB`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      onUploadSimulated(file.name, `${sizeInMB} MB`);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-secondary py-10 px-4 text-center cursor-pointer hover:bg-surface-tertiary transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="mt-3 text-sm font-semibold text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-xs text-text-muted">
          PDF formatting only. Maximum file size 5MB.
        </p>

        <button
          type="button"
          className="mt-4 rounded-md border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary shadow-sm"
        >
          Select Resume
        </button>
      </div>

      {/* Footer Generate Option */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-4 sm:flex-row">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          onClick={onGenerateSimulated}
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 shadow-sm"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate Resume from Profile
        </button>
      </div>
    </div>
  );
}
