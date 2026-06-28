import Link from "next/link";

type Props = {
  className?: string;
};

export function CtaButtons({ className }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md bg-overlay-dark px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Get Started
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
      >
        Find Your First Match
      </Link>
    </div>
  );
}
