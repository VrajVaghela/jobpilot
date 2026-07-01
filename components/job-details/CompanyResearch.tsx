"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CompanyDossier {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
}

interface Props {
  jobId: string;
  companyName: string | null;
  companyResearch: CompanyDossier | null;
}

export function CompanyResearch({ jobId, companyName, companyResearch }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to research company.");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-bold text-text-primary">
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          Company Research
        </div>

        {!companyResearch && (
          <button
            type="button"
            disabled={loading}
            onClick={handleResearch}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Researching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                Research Company
              </>
            )}
          </button>
        )}
      </div>

      {!companyResearch ? (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-muted rounded-xl bg-surface-secondary">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-accent mb-4 border border-border shadow-sm">
                <svg className="animate-spin h-7 w-7" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-text-primary">Researching {companyName || "the company"}</h3>
              <p className="max-w-xs text-xs font-semibold text-text-secondary mt-1.5 leading-relaxed">
                Browsing their site and synthesizing a dossier — this can take a minute.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-muted rounded-xl bg-surface-secondary">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-text-muted mb-4 border border-border shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-text-primary">No research yet</h3>
              <p className="max-w-xs text-xs font-semibold text-text-secondary mt-1.5 leading-relaxed">
                Click &ldquo;Research Company&rdquo; to let the AI browse {companyName || "the company"}&apos;s public pages and build a dossier.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-danger-lightest border border-danger-light/30 px-4 py-3 text-sm text-danger-darker font-medium">
              <svg className="w-4 h-4 shrink-0 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={handleResearch}
                className="text-xs font-bold underline hover:opacity-80"
              >
                Retry
              </button>
            </div>
          )}
        </>
      ) : (
        <Dossier dossier={companyResearch} />
      )}
    </div>
  );
}

function Dossier({ dossier }: { dossier: CompanyDossier }) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Company Overview">
        <p className="text-sm font-medium text-text-primary leading-relaxed">
          {dossier.companyOverview}
        </p>
      </Section>

      <Section title="Tech Stack">
        {dossier.techStack.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dossier.techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-info-light px-3 py-1 text-xs font-semibold text-info-foreground border border-info-light"
              >
                {tech}
              </span>
            ))}
          </div>
        ) : (
          <EmptyHint>No tech stack details surfaced.</EmptyHint>
        )}
      </Section>

      <Section title="Culture">
        <BulletList items={dossier.culture} />
      </Section>

      <Section title="Why This Role">
        <p className="text-sm font-medium text-text-primary leading-relaxed">
          {dossier.whyThisRole}
        </p>
      </Section>

      <Section title="Your Edge" accent>
        <BulletList items={dossier.yourEdge} variant="edge" />
      </Section>

      <Section title="Gaps to Address">
        <BulletList items={dossier.gapsToAddress} variant="gap" />
      </Section>

      <Section title="Smart Questions to Ask">
        <BulletList items={dossier.smartQuestions} variant="question" />
      </Section>

      <Section title="Interview Prep">
        <BulletList items={dossier.interviewPrep} />
      </Section>

      {dossier.sources && dossier.sources.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-2">
            Sources
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {dossier.sources.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-accent hover:underline truncate max-w-xs"
              >
                {src}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={`text-xs font-bold tracking-wider uppercase ${
          accent ? "text-accent" : "text-text-secondary"
        }`}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function BulletList({
  items,
  variant = "default",
}: {
  items: string[];
  variant?: "default" | "edge" | "gap" | "question";
}) {
  if (!items || items.length === 0) {
    return <EmptyHint>Nothing surfaced here.</EmptyHint>;
  }

  const dotClasses: Record<typeof variant, string> = {
    default: "bg-text-muted",
    edge: "bg-emerald-500",
    gap: "bg-amber-500",
    question: "bg-accent",
  };

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 text-sm font-medium text-text-primary leading-relaxed"
        >
          <span
            className={`mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotClasses[variant]}`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-text-muted">{children}</p>;
}
