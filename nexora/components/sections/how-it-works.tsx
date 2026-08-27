import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { steps } from "@/lib/landing-content";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-t border-border bg-muted/30 py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          kicker="How it works"
          titleId="how-it-works-heading"
          title="From signup to shipping in one afternoon"
          description="No consultants, no six-week rollouts. Three steps and your team is operating on a single platform."
        />

        {steps.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Steps coming soon.
          </p>
        ) : (
          <ol
            role="list"
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10"
          >
            {steps.map((step, idx) => (
              <li key={step.number} className="relative">
                {/* Connector line on desktop */}
                {idx < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[54px] top-6 hidden h-px w-[calc(100%-32px)] bg-border md:block"
                  />
                ) : null}

                <div className="flex items-start gap-5">
                  <span
                    aria-hidden="true"
                    className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-lg font-semibold text-primary shadow-sm"
                  >
                    {step.number}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}
