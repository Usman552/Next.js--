import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28"
    >
      {/* Ambient gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
      >
        <div className="h-[520px] w-[820px] max-w-full rounded-full bg-[radial-gradient(closest-side,oklch(0.72_0.19_264_/_0.28),transparent_75%)] blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-40 -z-10 hidden h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,oklch(0.75_0.16_210_/_0.22),transparent_70%)] blur-3xl md:block"
      />

      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 rounded-full border-border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Now in public beta</span>
          </Badge>

          <h1
            id="hero-heading"
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            The operating system for{" "}
            <span className="bg-gradient-to-r from-primary to-[oklch(0.72_0.16_210)] bg-clip-text text-transparent">
              modern product teams
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Plan, build, and measure everything in one workspace. Nexora
            replaces the tangle of project trackers, docs, and dashboards with a
            single tool your team actually enjoys using.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signin?callbackUrl=/app">
                Start for free
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Free for teams up to 10
          </p>
        </div>

        {/* Product mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 ring-1 ring-black/5 dark:ring-white/5">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.18_25)]" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.85_0.15_80)]" aria-hidden="true" />
              <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.17_150)]" aria-hidden="true" />
              <span className="ml-3 text-xs text-muted-foreground">
                app.nexora.example.com
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3 sm:p-8">
              <div className="col-span-1 space-y-3 rounded-lg bg-muted p-4">
                <div className="h-2 w-24 rounded-full bg-primary/60" />
                <div className="h-2 w-32 rounded-full bg-foreground/15" />
                <div className="h-2 w-20 rounded-full bg-foreground/15" />
                <div className="mt-6 h-2 w-28 rounded-full bg-foreground/15" />
                <div className="h-2 w-24 rounded-full bg-foreground/15" />
                <div className="h-2 w-32 rounded-full bg-foreground/15" />
              </div>
              <div className="col-span-1 space-y-3 rounded-lg bg-background p-4 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-40 rounded-full bg-foreground/70" />
                  <div className="ml-auto h-6 w-16 rounded-md bg-primary/20" />
                </div>
                <div className="h-24 rounded-md bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="h-16 rounded-md bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
