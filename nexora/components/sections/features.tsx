import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { features } from "@/lib/landing-content";

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          kicker="Features"
          titleId="features-heading"
          title={<>Everything a modern team needs, nothing it doesn&rsquo;t</>}
          description={
            <>
              Nexora is built around the workflows product teams actually run —
              from first idea to production deploy — with the polish
              you&rsquo;d expect from the tools you already love.
            </>
          }
        />

        {features.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            No features to display yet.
          </p>
        ) : (
          <ul
            role="list"
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map(({ title, description, icon: Icon }) => (
              <li key={title}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="space-y-1.5">
                      <CardTitle>{title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {description}
                      </CardDescription>
                    </div>
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
