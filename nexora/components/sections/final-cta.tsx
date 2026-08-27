import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function FinalCTA() {
  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className="py-24 sm:py-32"
    >
      <Container>
        <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-[oklch(0.55_0.22_264)] to-[oklch(0.5_0.24_290)] px-8 py-16 text-center shadow-xl sm:px-16 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-black/20 blur-3xl"
          />

          <h2
            id="final-cta-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl"
          >
            Ready to give your team a better home?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-primary-foreground/80 sm:text-lg">
            Get started free in under a minute. No credit card, no sales call —
            just a workspace your team will thank you for.
          </p>
          <div className="mt-9 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href="/auth/signin?callbackUrl=/app">
                Start for free
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
