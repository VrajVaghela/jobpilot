import { CtaButtons } from "@/components/homepage/CtaButtons";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div
        className="rounded-xl border border-border px-6 py-16 text-center"
        style={{
          background:
            "radial-gradient(70% 120% at 50% 0%, var(--color-accent-light), var(--color-surface) 70%)",
        }}
      >
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-text-primary">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
          Set up your profile, upload your resume, and let JobPilot do the
          searching, scoring, and research for you.
        </p>
        <CtaButtons className="mt-8 justify-center" />
      </div>
    </section>
  );
}
