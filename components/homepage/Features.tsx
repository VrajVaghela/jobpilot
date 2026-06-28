import Image from "next/image";

import jobsList from "@/public/images/jobs-lists.png";

const points = [
  {
    title: "Find Jobs That Actually Fit",
    description:
      "Search by title and location and let JobPilot score every role 0–100 against your actual skills and experience — no more guessing which listings are worth your time.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "One click researches the company across their public pages and builds a structured dossier — tech stack, culture, and why the role exists.",
  },
  {
    title: "Keep Track of Every Application",
    description:
      "Every job you discover lands in one organized list with match scores, salary estimates, and source — sortable, filterable, and always up to date.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Manage Your Job Search With Ease
          </h2>
          <div className="mt-8 flex flex-col gap-7">
            {points.map((point) => (
              <div key={point.title}>
                <h3 className="text-base font-semibold text-text-primary">
                  {point.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <Image
            src={jobsList}
            alt="JobPilot scored jobs list"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
