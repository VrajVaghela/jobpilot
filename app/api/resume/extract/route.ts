import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { PDFParse } from "pdf-parse";

// Define the schema for the Gemini response matching ProfileData structure
const profileSchema = {
  type: SchemaType.OBJECT,
  properties: {
    full_name: { type: SchemaType.STRING, description: "Full name of the candidate" },
    phone: { type: SchemaType.STRING, description: "Phone number of the candidate" },
    location: { type: SchemaType.STRING, description: "City and State or Country of residence" },
    linkedin_url: { type: SchemaType.STRING, description: "LinkedIn profile URL" },
    portfolio_url: { type: SchemaType.STRING, description: "Portfolio, GitHub, or personal website URL" },
    work_authorization: { 
      type: SchemaType.STRING, 
      description: "Work authorization status", 
      enum: ["citizen", "permanent_resident", "visa_required"] 
    },
    current_title: { type: SchemaType.STRING, description: "Current or most recent job title" },
    experience_level: { 
      type: SchemaType.STRING, 
      description: "Overall experience level", 
      enum: ["junior", "mid", "senior", "lead"] 
    },
    years_experience: { type: SchemaType.INTEGER, description: "Number of years of professional experience" },
    skills: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Key professional skills (e.g., React, TypeScript, Python)" 
    },
    industries: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Industries the candidate has worked in or is seeking" 
    },
    work_experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Generate a unique random 7-character alphanumeric string ID for this experience item" },
          company: { type: SchemaType.STRING, description: "Company name" },
          title: { type: SchemaType.STRING, description: "Job title" },
          start_date: { type: SchemaType.STRING, description: "Start date (e.g. MM/YYYY or YYYY)" },
          end_date: { type: SchemaType.STRING, description: "End date (e.g. MM/YYYY or YYYY), or empty string if currently working there" },
          currently_working: { type: SchemaType.BOOLEAN, description: "True if currently working here" },
          responsibilities: { type: SchemaType.STRING, description: "Detailed description of responsibilities and achievements in this role" }
        },
        required: ["id", "company", "title", "start_date", "currently_working", "responsibilities"]
      },
      description: "List of work experiences (up to 3 items)"
    },
    education: {
      type: SchemaType.OBJECT,
      properties: {
        highest_degree: { 
          type: SchemaType.STRING, 
          description: "Highest degree achieved", 
          enum: ["high_school", "associates", "bachelors", "masters", "mba", "phd"] 
        },
        field_of_study: { type: SchemaType.STRING, description: "Field of study (e.g. Computer Science)" },
        institution: { type: SchemaType.STRING, description: "School or University name" },
        graduation_year: { type: SchemaType.STRING, description: "Year of graduation (e.g. YYYY)" }
      },
      required: ["highest_degree", "field_of_study", "institution", "graduation_year"]
    },
    job_titles_seeking: { 
      type: SchemaType.STRING, 
      description: "Comma-separated list of job titles the candidate is seeking (e.g. 'Frontend Engineer, React Developer')" 
    },
    remote_preference: { 
      type: SchemaType.STRING, 
      description: "Remote work preference", 
      enum: ["any", "remote", "hybrid", "onsite"] 
    },
    salary_expectation: { type: SchemaType.STRING, description: "Target salary expectation (e.g., $120,000)" },
    preferred_locations: { 
      type: SchemaType.STRING, 
      description: "Comma-separated list of preferred locations" 
    }
  },
  required: [
    "full_name",
    "phone",
    "location",
    "current_title",
    "experience_level",
    "years_experience",
    "skills",
    "industries",
    "work_experience",
    "education",
    "job_titles_seeking",
    "remote_preference"
  ]
};

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storagePath = `${user.id}/resume.pdf`;

    // Download the resume from InsForge Storage
    const { data: fileBlob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(storagePath);

    if (downloadError || !fileBlob) {
      console.error("[extractRoute] Download failed:", downloadError);
      return NextResponse.json(
        { error: "Failed to locate or download your resume from storage. Please make sure you have uploaded it first." },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract raw text using pdf-parse
    let text = "";
    let parser;
    try {
      parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      text = pdfData.text;
    } catch (parseErr) {
      console.error("[extractRoute] PDF Parsing error:", parseErr);
      return NextResponse.json(
        { error: "Could not read the PDF structure. Please upload a standard text-based PDF." },
        { status: 400 }
      );
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text from this PDF. Please try a different file that has text, not scanned images." },
        { status: 400 }
      );
    }

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API_KEY;
    if (!apiKey) {
      console.error("[extractRoute] API key not configured");
      return NextResponse.json(
        { error: "Gemini API key is not configured on the server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: profileSchema as any,
      },
    });

    const prompt = `You are a resume parser AI. Analyze the extracted text from the user's resume.
Extract and map all information to the required JSON schema fields.
Ensure experience_level is one of: "junior", "mid", "senior", "lead".
Ensure work_authorization is one of: "citizen", "permanent_resident", "visa_required".
Ensure remote_preference is one of: "any", "remote", "hybrid", "onsite".
Ensure education.highest_degree is one of: "high_school", "associates", "bachelors", "masters", "mba", "phd".
Ensure you generate a unique, short random string (7 characters) for the "id" field of each work experience item.
Ensure you return all required fields specified in the schema.

RESUME TEXT:
"""
${text}
"""`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedText = response.text();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Failed to extract structured data from the resume." },
        { status: 500 }
      );
    }

    const profileData = JSON.parse(extractedText);

    // Merge email from session as it is not editable
    profileData.email = user.email || "";

    return NextResponse.json({ success: true, profile: profileData });
  } catch (err: any) {
    console.error("[extractRoute] Unexpected Error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during profile extraction." },
      { status: 500 }
    );
  }
}
