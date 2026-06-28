import Image from "next/image";

import userIcon from "@/public/images/user-icon.png";

export function Testimonial() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="text-sm font-medium text-accent">Loved by job seekers</p>
      <blockquote className="mt-6 text-2xl font-medium leading-snug tracking-tight text-text-primary">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating — I had 3
        offers in one week.&rdquo;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Image
          src={userIcon}
          alt="Daniel Rivera"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="text-left">
          <p className="text-sm font-medium text-text-primary">Daniel Rivera</p>
          <p className="text-xs text-text-muted">Frontend Engineer</p>
        </div>
      </div>
    </section>
  );
}
