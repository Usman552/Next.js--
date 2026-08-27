import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { pricingTiers } from "@/lib/landing-content";

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="border-t border-border bg-muted/30 py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          kicker="Pricing"
          titleId="pricing-heading"
          title="Simple pricing that scales with your team"
          description="Start free, upgrade when you need more. No hidden fees, no seat-count surprises, no annual lock-ins on Starter or Pro."
        />

        {pricingTiers.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Pricing coming soon.
          </p>
        ) : (
          <ul
            role="list"
            className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
          >
            {pricingTiers.map((tier) => (
              <li key={tier.name} className={cn(tier.recommended && "md:-mt-2")}>
                <Card
                  className={cn(
                    "flex h-full flex-col transition-shadow",
                    tier.recommended
                      ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                      : "hover:shadow-md"
                  )}
                >
                  <CardContent className="flex flex-1 flex-col gap-6 p-7">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                      {tier.recommended ? (
                        <Badge className="rounded-full">Most popular</Badge>
                      ) : null}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-semibold tracking-tight">
                        {tier.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {tier.cadence}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {tier.positioning}
                    </p>

                    <ul role="list" className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-auto w-full"
                      variant={tier.recommended ? "default" : "outline"}
                      asChild
                    >
                      <Link href={tier.ctaHref}>{tier.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
