import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Small uppercase eyebrow above the title (e.g. "Features"). */
  kicker?: ReactNode;
  /** The section H2. */
  title: ReactNode;
  /** Optional supporting paragraph under the title. */
  description?: ReactNode;
  /** The `id` for the H2 — used as the section's `aria-labelledby`. */
  titleId: string;
  className?: string;
};

/**
 * The kicker + H2 + description block reused by every content section on the
 * landing page. Sections wire their own `<section aria-labelledby={titleId}>`;
 * this component owns the typography.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {kicker ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {kicker}
        </p>
      ) : null}
      <h2
        id={titleId}
        className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
