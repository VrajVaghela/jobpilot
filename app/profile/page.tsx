import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileClient } from "@/components/profile/ProfileClient";
import type { ProfileData } from "@/actions/profile";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Retrieve the profile from the database
  const { data: dbProfile, error: dbError } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (dbError) {
    console.error("[ProfilePage] Error fetching profile:", dbError);
  }

  // Construct initial profile state (map database format to client state)
  const initialProfile: ProfileData = {
    full_name: dbProfile?.full_name || "",
    email: user.email || "",
    phone: dbProfile?.phone || "",
    location: dbProfile?.location || "",
    linkedin_url: dbProfile?.linkedin_url || "",
    portfolio_url: dbProfile?.portfolio_url || "",
    work_authorization: dbProfile?.work_authorization || "citizen",
    current_title: dbProfile?.current_title || "",
    experience_level: dbProfile?.experience_level || "junior",
    years_experience: dbProfile?.years_experience !== null && dbProfile?.years_experience !== undefined ? String(dbProfile.years_experience) : "",
    skills: dbProfile?.skills || [],
    industries: dbProfile?.industries || [],
    work_experience: dbProfile?.work_experience || [],
    education: {
      highest_degree: dbProfile?.education?.highest_degree || "high_school",
      field_of_study: dbProfile?.education?.field_of_study || "",
      institution: dbProfile?.education?.institution || "",
      graduation_year: dbProfile?.education?.graduation_year || "",
    },
    job_titles_seeking: Array.isArray(dbProfile?.job_titles_seeking)
      ? dbProfile.job_titles_seeking.join(", ")
      : "",
    remote_preference: dbProfile?.remote_preference || "any",
    salary_expectation: dbProfile?.salary_expectation || "",
    preferred_locations: Array.isArray(dbProfile?.preferred_locations)
      ? dbProfile.preferred_locations.join(", ")
      : "",
  };

  let initialResumePdfUrl = null;
  if (dbProfile?.resume_pdf_url) {
    const { data: signedData } = await insforge.storage
      .from("resumes")
      .createSignedUrl(`${user.id}/resume.pdf`, 3600); // 1 hour expiry
    initialResumePdfUrl = signedData?.signedUrl || null;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <ProfileClient 
          userEmail={user.email} 
          initialProfile={initialProfile}
          initialResumePdfUrl={initialResumePdfUrl}
        />
      </main>
      <Footer />
    </>
  );
}

