import Image from "next/image";

import { Container } from "@/components/ui/container";
import { trustedLogos } from "@/lib/landing-content";

export function TrustedBy() {
  return (
    <section
      id="trusted-by"
      aria-labelledby="trusted-by-heading"
      className="border-y border-border bg-muted/30 py-12 sm:py-16"
    >
      <Container>
        <h2
          id="trusted-by-heading"
          className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          Trusted by teams at the world&rsquo;s most demanding companies
        </h2>

        {trustedLogos.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Customer logos coming soon.
          </p>
        ) : (
          <ul
            role="list"
            className="mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8"
          >
            {trustedLogos.map((logo) => (
              <li
                key={logo.name}
                className="flex items-center justify-center text-muted-foreground/80"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={160}
                  height={40}
                  className="h-8 w-auto opacity-70 transition-opacity hover:opacity-100"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
