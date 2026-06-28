import React, { useState } from "react";

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

interface ProfileFormProps {
  initialData: ProfileData;
  onChange: (newData: ProfileData) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function ProfileForm({ initialData, onChange, onSave, isSaving = false }: ProfileFormProps) {
  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");

  const updateField = (field: keyof ProfileData, value: any) => {
    onChange({
      ...initialData,
      [field]: value,
    });
  };

  const updateEducationField = (field: string, value: any) => {
    onChange({
      ...initialData,
      education: {
        ...initialData.education,
        [field]: value,
      },
    });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !initialData.skills.includes(skillInput.trim())) {
      updateField("skills", [...initialData.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField(
      "skills",
      initialData.skills.filter((s) => s !== skillToRemove)
    );
  };

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (industryInput.trim() && !initialData.industries.includes(industryInput.trim())) {
      updateField("industries", [...initialData.industries, industryInput.trim()]);
      setIndustryInput("");
    }
  };

  const handleRemoveIndustry = (industryToRemove: string) => {
    updateField(
      "industries",
      initialData.industries.filter((i) => i !== industryToRemove)
    );
  };

  const handleAddWorkExperience = () => {
    const newRole: WorkExperienceItem = {
      id: Math.random().toString(36).substring(2, 9),
      company: "",
      title: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      responsibilities: "",
    };
    updateField("work_experience", [...initialData.work_experience, newRole]);
  };

  const handleUpdateWorkExperience = (index: number, field: keyof WorkExperienceItem, value: any) => {
    const updated = initialData.work_experience.map((item, idx) => {
      if (idx === index) {
        const itemCopy = { ...item, [field]: value };
        if (field === "currently_working" && value === true) {
          itemCopy.end_date = "";
        }
        return itemCopy;
      }
      return item;
    });
    updateField("work_experience", updated);
  };

  const handleRemoveWorkExperience = (index: number) => {
    updateField(
      "work_experience",
      initialData.work_experience.filter((_, idx) => idx !== index)
    );
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div>
        <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="mt-8 space-y-8"
      >
        {/* PERSONAL INFO SECTION */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dark border-b border-border pb-2 mb-4">
            Personal Info
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={initialData.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="Faizan Ali"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={initialData.email}
                disabled
                className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-secondary cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={initialData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={initialData.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="City, Country"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Linkedin URL
              </label>
              <input
                type="url"
                value={initialData.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Portfolio / Github
              </label>
              <input
                type="url"
                value={initialData.portfolio_url}
                onChange={(e) => updateField("portfolio_url", e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="md:col-span-2">
              <div className="w-full md:w-1/2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Work Authorization
                </label>
                <select
                  value={initialData.work_authorization}
                  onChange={(e) => updateField("work_authorization", e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="citizen">Citizen</option>
                  <option value="permanent_resident">Permanent Resident</option>
                  <option value="visa_required">Visa Required / Sponsor Needed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* PROFESSIONAL INFO SECTION */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dark border-b border-border pb-2 mb-4">
            Professional Info
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Current/Recent Job Title
                </label>
                <input
                  type="text"
                  value={initialData.current_title}
                  onChange={(e) => updateField("current_title", e.target.value)}
                  placeholder="Frontend Engineer"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={initialData.experience_level}
                    onChange={(e) => updateField("experience_level", e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={initialData.years_experience}
                    onChange={(e) => updateField("years_experience", e.target.value)}
                    placeholder="4"
                    min="0"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Skills Tag Input */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary shadow-sm transition-colors"
                >
                  Add
                </button>
              </div>
              {/* Skill Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {initialData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent border border-accent-light"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-accent hover:text-accent-dark font-bold text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Industries worked in */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Industries Worked In (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  placeholder="E.g. FinTech, Healthcare"
                  className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddIndustry(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddIndustry}
                  className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary shadow-sm transition-colors"
                >
                  Add
                </button>
              </div>
              {/* Industry Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {initialData.industries.map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-tertiary px-3 py-1 text-xs font-medium text-text-secondary border border-border-muted"
                  >
                    {ind}
                    <button
                      type="button"
                      onClick={() => handleRemoveIndustry(ind)}
                      className="text-text-muted hover:text-text-secondary font-bold text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WORK EXPERIENCE SECTION */}
        <div>
          <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dark">
              Work Experience
            </h3>
            <button
              type="button"
              onClick={handleAddWorkExperience}
              className="text-sm font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <span>+ Add role</span>
            </button>
          </div>

          <div className="space-y-6">
            {initialData.work_experience.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="relative rounded-lg border border-border p-4 bg-surface-secondary"
              >
                {/* Remove role button */}
                <button
                  type="button"
                  onClick={() => handleRemoveWorkExperience(idx)}
                  className="absolute right-4 top-4 text-xs font-semibold text-error hover:underline"
                >
                  Remove
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateWorkExperience(idx, "company", e.target.value)}
                      placeholder="Company Name"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleUpdateWorkExperience(idx, "title", e.target.value)}
                      placeholder="Job Title"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) => handleUpdateWorkExperience(idx, "start_date", e.target.value)}
                      placeholder="January 2022"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                        End Date
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.currently_working}
                          onChange={(e) =>
                            handleUpdateWorkExperience(idx, "currently_working", e.target.checked)
                          }
                          className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent"
                        />
                        <span>Currently working here</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={exp.currently_working ? "" : exp.end_date}
                      disabled={exp.currently_working}
                      onChange={(e) => handleUpdateWorkExperience(idx, "end_date", e.target.value)}
                      placeholder={exp.currently_working ? "----------- ----" : "Present / December 2025"}
                      className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent ${
                        exp.currently_working ? "bg-surface-muted text-text-muted cursor-not-allowed border-dashed" : ""
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                      Key Responsibilities
                    </label>
                    <textarea
                      rows={3}
                      value={exp.responsibilities}
                      onChange={(e) =>
                        handleUpdateWorkExperience(idx, "responsibilities", e.target.value)
                      }
                      placeholder="Describe your achievements and tasks..."
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}

            {initialData.work_experience.length === 0 && (
              <div className="text-center py-6 border border-dashed border-border rounded-lg bg-surface-secondary text-sm text-text-muted">
                No roles added yet. Click "+ Add role" to document your work experience.
              </div>
            )}
          </div>
        </div>

        {/* EDUCATION SECTION */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dark border-b border-border pb-2 mb-4">
            Education
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Highest Degree
              </label>
              <select
                value={initialData.education.highest_degree}
                onChange={(e) => updateEducationField("highest_degree", e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="high_school">High School</option>
                <option value="associates">Associate's Degree</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="mba">MBA</option>
                <option value="phd">Ph.D.</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Field of Study
              </label>
              <input
                type="text"
                value={initialData.education.field_of_study}
                onChange={(e) => updateEducationField("field_of_study", e.target.value)}
                placeholder="Computer Science"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Institution Name
              </label>
              <input
                type="text"
                value={initialData.education.institution}
                onChange={(e) => updateEducationField("institution", e.target.value)}
                placeholder="E.g. State University"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Graduation Year
              </label>
              <input
                type="text"
                value={initialData.education.graduation_year}
                onChange={(e) => updateEducationField("graduation_year", e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* JOB PREFERENCES SECTION */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dark border-b border-border pb-2 mb-4">
            Job Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Job Titles Seeking
              </label>
              <input
                type="text"
                value={initialData.job_titles_seeking}
                onChange={(e) => updateField("job_titles_seeking", e.target.value)}
                placeholder="Frontend Engineer, React Developer"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Remote Preference
                </label>
                <select
                  value={initialData.remote_preference}
                  onChange={(e) => updateField("remote_preference", e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Salary Expectation (Optional)
                </label>
                <input
                  type="text"
                  value={initialData.salary_expectation}
                  onChange={(e) => updateField("salary_expectation", e.target.value)}
                  placeholder="E.g. $120k+"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Preferred Locations (Optional)
              </label>
              <input
                type="text"
                value={initialData.preferred_locations}
                onChange={(e) => updateField("preferred_locations", e.target.value)}
                placeholder="E.g. New York, London"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* SAVE PROFILE ACTION */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && (
              <svg
                className="h-4 w-4 animate-spin text-accent-foreground"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSaving ? "Saving Profile..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
