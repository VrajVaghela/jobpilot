import Image from "next/image";

import agentLog from "@/public/images/agnet-log.png";

const points = [
  {
    title: "Understand Your Talent Stack",
    description:
      "Upload your resume once and JobPilot extracts your skills, experience, and history — the foundation every match is scored against.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "GPT-4o reads each listing and returns a score, the reasoning behind it, the skills you match, and the ones you're missing.",
  },
  {
    title: "Focus on the Right Roles",
    description:
      "High-confidence matches rise to the top so you spend your energy on the roles most likely to turn into offers.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 overflow-hidden rounded-xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] lg:order-1">
          <Image
            src={agentLog}
            alt="JobPilot agent activity log"
            className="h-auto w-full"
          />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Apply With More Confidence, Every Time
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
      </div>
    </section>
  );
}
