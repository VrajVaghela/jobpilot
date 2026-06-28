import Image from "next/image";

import { CtaButtons } from "@/components/homepage/CtaButtons";
import dashboardDemo from "@/public/images/dashboard-demo.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, var(--color-accent-light), transparent 70%), radial-gradient(45% 45% at 82% 8%, var(--color-info-light), transparent 70%), radial-gradient(45% 45% at 18% 12%, var(--color-accent-muted), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pb-12 pt-20 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight text-text-primary sm:text-6xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
          JobPilot finds the roles that fit you, scores every match against your
          real skills, and researches each company — so you walk into every
          application fully prepared.
        </p>

        <CtaButtons className="mt-8 justify-center" />
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <Image
            src={dashboardDemo}
            alt="JobPilot dashboard preview"
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
