import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/landing-content";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          kicker="Testimonials"
          titleId="testimonials-heading"
          title="Loved by teams shipping every day"
          description="From five-person startups to public companies, teams tell us Nexora is the rare tool that made work feel lighter."
        />

        {testimonials.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Testimonials coming soon.
          </p>
        ) : (
          <ul
            role="list"
            className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2"
          >
            {testimonials.map((t) => (
              <li key={t.author}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-6 p-7">
                    <blockquote className="text-lg font-medium leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto flex items-center gap-4 not-italic">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-sm font-semibold text-primary-foreground"
                      >
                        {t.initials}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {t.author}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t.role} · {t.company}
                        </span>
                      </span>
                    </figcaption>
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
