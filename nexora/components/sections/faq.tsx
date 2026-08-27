"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/landing-content";

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          kicker="FAQ"
          titleId="faq-heading"
          title="Questions, answered"
          description={
            <>
              Everything you need to know before signing up. Can&rsquo;t find
              what you&rsquo;re looking for? Ping us any time.
            </>
          }
        />

        {faqs.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            FAQs coming soon.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="mx-auto mt-12 max-w-3xl"
          >
            {faqs.map((faq, idx) => (
              <AccordionItem key={faq.question} value={`item-${idx}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Container>
    </section>
  );
}
