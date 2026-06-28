"use server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { revalidatePath } from "next/cache";

export interface WorkExperienceItem {
  id: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  responsibilities: string;
}

export interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  current_title: string;
  experience_level: string;
  years_experience: string | number;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceItem[];
  education: {
    highest_degree: string;
    field_of_study: string;
    institution: string;
    graduation_year: string;
  };
  job_titles_seeking: string;
  remote_preference: string;
  salary_expectation: string;
  preferred_locations: string;
}

// Function to calculate completeness (percentage and missing fields)
function calculateCompleteness(profile: Omit<ProfileData, "email"> & { email?: string }) {
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

  return { percent: score, missingFields: missing, isComplete: score === 100 };
}

/**
 * Saves all profile fields to the profiles table.
 */
export async function saveProfile(profileData: ProfileData) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { isComplete } = calculateCompleteness(profileData);

    // Transform client fields to DB schema fields
    const dbData = {
      id: user.id, // user.id in InsForge matches user.sub (and maps to uuid column id)
      full_name: profileData.full_name,
      email: user.email, // email is pre-filled from session
      phone: profileData.phone || null,
      location: profileData.location || null,
      linkedin_url: profileData.linkedin_url || null,
      portfolio_url: profileData.portfolio_url || null,
      work_authorization: profileData.work_authorization || null,
      current_title: profileData.current_title || null,
      experience_level: profileData.experience_level || null,
      years_experience: profileData.years_experience ? parseInt(String(profileData.years_experience), 10) : null,
      skills: profileData.skills || [],
      industries: profileData.industries || [],
      work_experience: profileData.work_experience || [],
      education: profileData.education || {},
      job_titles_seeking: profileData.job_titles_seeking
        ? profileData.job_titles_seeking.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      remote_preference: profileData.remote_preference || null,
      salary_expectation: profileData.salary_expectation || null,
      preferred_locations: profileData.preferred_locations
        ? profileData.preferred_locations.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
    };

    // We do an upsert
    const { error: dbError } = await insforge.database
      .from("profiles")
      .upsert(dbData);

    if (dbError) {
      console.error("[saveProfile] DB Error:", dbError);
      return { success: false, error: dbError.message || "Database update failed" };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    console.error("[saveProfile] Unexpected Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

/**
 * Uploads a resume PDF to the resumes bucket and saves its public URL to the profile.
 */
export async function uploadResume(formData: FormData) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Server-side validations
    if (file.type !== "application/pdf") {
      return { success: false, error: "Invalid file type. Only PDF is allowed." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size exceeds the 5MB limit." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    // Upload to InsForge Storage: resumes/{user_id}/resume.pdf
    const storagePath = `${user.id}/resume.pdf`;
    const { error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, blob);

    if (uploadError) {
      console.error("[uploadResume] Storage upload failed:", uploadError);
      return { success: false, error: uploadError.message || "Failed to upload file to storage" };
    }

    // Get the public URL
    const { data: urlData } = insforge.storage
      .from("resumes")
      .getPublicUrl(storagePath);

    if (!urlData || !urlData.publicUrl) {
      return { success: false, error: "Failed to resolve public URL for uploaded resume" };
    }

    const publicUrl = urlData.publicUrl;

    // Update profiles table with resume_pdf_url
    const { error: dbError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: publicUrl })
      .eq("id", user.id);

    if (dbError) {
      console.error("[uploadResume] DB Update failed:", dbError);
      return { success: false, error: dbError.message || "Failed to update profile database" };
    }

    // Generate a signed URL for client download
    const { data: signedData, error: signedError } = await insforge.storage
      .from("resumes")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (signedError || !signedData?.signedUrl) {
      console.error("[uploadResume] Failed to create signed URL:", signedError);
      return { success: false, error: "Uploaded, but failed to generate signed download link." };
    }

    revalidatePath("/profile");
    return { success: true, url: signedData.signedUrl };
  } catch (err: any) {
    console.error("[uploadResume] Unexpected Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

/**
 * Removes the resume from storage and updates the profiles table.
 */
export async function deleteResume() {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const storagePath = `${user.id}/resume.pdf`;

    // Remove from storage
    const { error: storageError } = await insforge.storage
      .from("resumes")
      .remove(storagePath);

    // Note: If the file wasn't found in storage, we can still proceed to clear the DB field
    if (storageError && !storageError.message.includes("not found")) {
      console.warn("[deleteResume] Warning: Storage removal encountered an issue:", storageError);
    }

    // Clear resume_pdf_url in profiles table
    const { error: dbError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: null })
      .eq("id", user.id);

    if (dbError) {
      console.error("[deleteResume] DB Update failed:", dbError);
      return { success: false, error: dbError.message || "Failed to clear resume link from profile" };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    console.error("[deleteResume] Unexpected Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
