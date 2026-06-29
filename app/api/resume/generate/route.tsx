import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import React from "react";

// Define styles for the professional single-page resume
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Helvetica",
    color: "#2D3748",
    fontSize: 9,
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#3182CE", // Accent primary color wash
    paddingBottom: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1A202C",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 11,
    color: "#3182CE",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 8,
    fontSize: 8.5,
    color: "#4A5568",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2D3748",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9,
    color: "#4A5568",
    lineHeight: 1.4,
  },
  jobEntry: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
    color: "#2D3748",
    fontSize: 9,
  },
  jobCompany: {
    color: "#1A202C",
  },
  jobDates: {
    color: "#718096",
    fontSize: 8.5,
  },
  jobTitle: {
    fontSize: 8.5,
    color: "#4A5568",
    fontFamily: "Helvetica-Oblique",
    marginTop: 1,
  },
  bulletList: {
    marginTop: 4,
    paddingLeft: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 2.5,
  },
  bulletSign: {
    width: 6,
    fontSize: 8.5,
    color: "#718096",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: "#4A5568",
    lineHeight: 1.35,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  skillTag: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    color: "#2D3748",
  },
  eduEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eduSchool: {
    fontFamily: "Helvetica-Bold",
    color: "#2D3748",
  },
  eduDegree: {
    color: "#4A5568",
    fontSize: 8.5,
    marginTop: 1,
  },
  eduYear: {
    color: "#718096",
    fontSize: 8.5,
  }
});

interface PDFResumeProps {
  profile: any;
  enhancedSummary: string;
  enhancedWorkExperience: any[];
}

// PDF Document Component structure
const PDFResume = ({ profile, enhancedSummary, enhancedWorkExperience }: PDFResumeProps) => {
  // Map experiences to enhanced bullet points
  const experiences = (profile.work_experience || []).map((exp: any) => {
    const enhanced = enhancedWorkExperience.find((item: any) => item.id === exp.id);
    return {
      ...exp,
      bullets: enhanced && Array.isArray(enhanced.responsibilities)
        ? enhanced.responsibilities
        : (exp.responsibilities ? exp.responsibilities.split("\n").map((b: string) => b.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean) : ["Responsible for key deliverables."]),
    };
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name}</Text>
          {profile.current_title && <Text style={styles.title}>{profile.current_title}</Text>}
          <View style={styles.contactInfo}>
            <Text>{profile.email}</Text>
            {profile.phone && <Text>| {profile.phone}</Text>}
            {profile.location && <Text>| {profile.location}</Text>}
            {profile.linkedin_url && <Text>| LinkedIn: {profile.linkedin_url}</Text>}
            {profile.portfolio_url && <Text>| Portfolio: {profile.portfolio_url}</Text>}
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summaryText}>{enhancedSummary}</Text>
        </View>

        {/* Work Experience */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experiences.map((exp: any, idx: number) => (
              <View key={exp.id || idx} style={styles.jobEntry}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobCompany}>{exp.company}</Text>
                  <Text style={styles.jobDates}>
                    {exp.start_date} – {exp.currently_working ? "Present" : exp.end_date}
                  </Text>
                </View>
                <Text style={styles.jobTitle}>{exp.title}</Text>
                <View style={styles.bulletList}>
                  {exp.bullets.map((bullet: string, bIdx: number) => (
                    <View key={bIdx} style={styles.bulletPoint}>
                      <Text style={styles.bulletSign}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {profile.education && (profile.education.institution || profile.education.highest_degree) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.eduEntry}>
              <View>
                <Text style={styles.eduSchool}>{profile.education.institution}</Text>
                <Text style={styles.eduDegree}>
                  {profile.education.highest_degree.toUpperCase()} in {profile.education.field_of_study || "N/A"}
                </Text>
              </View>
              <Text style={styles.eduYear}>{profile.education.graduation_year || "N/A"}</Text>
            </View>
          </View>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill: string, idx: number) => (
                <Text key={idx} style={styles.skillTag}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Schema for structured Gemini output
const geminiSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { 
      type: SchemaType.STRING, 
      description: "A polished professional summary paragraph tailored to seeking roles, maximum 3 sentences." 
    },
    work_experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "The original ID of the work experience item." },
          responsibilities: { 
            type: SchemaType.ARRAY, 
            items: { type: SchemaType.STRING },
            description: "Clean, professional, action-oriented accomplishments or bullet points (do not include bullet characters like •)." 
          }
        },
        required: ["id", "responsibilities"]
      },
      description: "An array mapping original experience IDs to polished accomplishments."
    }
  },
  required: ["summary", "work_experience"]
};

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user's profile
    const { data: profile, error: dbError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError || !profile) {
      console.error("[generateRoute] DB Fetch Error:", dbError);
      return NextResponse.json(
        { error: "Could not find profile details. Please fill in your profile before generating a resume." },
        { status: 400 }
      );
    }

    if (!profile.full_name) {
      return NextResponse.json(
        { error: "Full Name is required in your profile to generate a resume." },
        { status: 400 }
      );
    }

    // 2. Prepare Gemini client and invoke for polished content
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API_KEY;
    let enhancedSummary = `Experienced professional specializing in ${profile.current_title || "software development"}.`;
    let enhancedWorkExperience = (profile.work_experience || []).map((exp: any) => ({
      id: exp.id,
      responsibilities: exp.responsibilities
        ? exp.responsibilities.split("\n").map((b: string) => b.replace(/^[•\-\*\s]+/, "").trim()).filter(Boolean)
        : ["Responsible for key project deliverables."]
    }));

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiSchema as any,
          },
        });

        const prompt = `You are an expert resume writer. Enhance and polish the candidate's profile information into a high-impact, professional resume presentation.
        Generate a compelling professional summary (max 3 sentences) tailored to their target titles.
        For each work experience entry, polish the responsibilities text into 3-4 professional, result-oriented achievements. Use active verbs.
        Ensure you map back to each work experience item by its original ID.

        CANDIDATE DETAILS:
        Full Name: ${profile.full_name}
        Current Job Title: ${profile.current_title || "Software Professional"}
        Overall Experience Level: ${profile.experience_level || "Not Specified"}
        Years of Experience: ${profile.years_experience || 0}
        Skills: ${profile.skills ? profile.skills.join(", ") : ""}
        Industries: ${profile.industries ? profile.industries.join(", ") : ""}
        Job Titles Seeking: ${profile.job_titles_seeking ? profile.job_titles_seeking.join(", ") : ""}

        WORK EXPERIENCE ITEMS TO POLISH:
        ${(profile.work_experience || []).map((exp: any) => `
        ID: ${exp.id}
        Company: ${exp.company}
        Job Title: ${exp.title}
        Raw responsibilities/description:
        ${exp.responsibilities || ""}
        `).join("\n---")}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resText = response.text();
        if (resText) {
          const parsed = JSON.parse(resText);
          if (parsed.summary) {
            enhancedSummary = parsed.summary;
          }
          if (parsed.work_experience && Array.isArray(parsed.work_experience)) {
            enhancedWorkExperience = parsed.work_experience;
          }
        }
      } catch (geminiErr) {
        console.error("[generateRoute] Gemini polishing failed, falling back to profile raw text:", geminiErr);
      }
    } else {
      console.warn("[generateRoute] GEMINI_API_KEY not configured, generating PDF with raw profile text.");
    }

    // 3. Render PDF document to a buffer using react-pdf
    let pdfBuffer: Buffer;
    try {
      const doc = <PDFResume 
        profile={profile} 
        enhancedSummary={enhancedSummary} 
        enhancedWorkExperience={enhancedWorkExperience} 
      />;
      const pdfStream = await pdf(doc).toBuffer();
      
      const chunks: any[] = [];
      for await (const chunk of pdfStream as any) {
        chunks.push(chunk);
      }
      pdfBuffer = Buffer.concat(chunks);
    } catch (pdfErr: any) {
      console.error("[generateRoute] PDF Generation error:", pdfErr);
      return NextResponse.json(
        { error: `PDF generation engine failed: ${pdfErr.message || pdfErr}` },
        { status: 500 }
      );
    }

    // 4. Upload PDF buffer to InsForge Storage resumes/{user_id}/resume.pdf
    const storagePath = `${user.id}/resume.pdf`;
    const { error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }));

    if (uploadError) {
      console.error("[generateRoute] Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload generated PDF to storage." },
        { status: 500 }
      );
    }

    // 5. Get Public URL
    const { data: urlData } = insforge.storage
      .from("resumes")
      .getPublicUrl(storagePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { error: "Failed to resolve public URL for the generated resume PDF." },
        { status: 500 }
      );
    }

    const publicUrl = urlData.publicUrl;

    // 6. Update database profiles table with resume_pdf_url
    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[generateRoute] Database update failed:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update profile resume link in database." },
        { status: 500 }
      );
    }

    // 7. Generate a signed URL for client download
    const { data: signedData, error: signedError } = await insforge.storage
      .from("resumes")
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (signedError || !signedData?.signedUrl) {
      console.error("[generateRoute] Signed URL creation failed:", signedError);
      return NextResponse.json(
        { error: "Resume generated and saved, but failed to create a signed download link." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedData.signedUrl,
      fileName: `${profile.full_name.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`
    });

  } catch (err: any) {
    console.error("[generateRoute] Unexpected Error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during resume generation." },
      { status: 500 }
    );
  }
}
