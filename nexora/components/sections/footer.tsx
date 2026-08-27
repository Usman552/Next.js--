import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { Container } from "@/components/ui/container";
import { siteConfig, type SocialLink } from "@/lib/site-config";

type SocialIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const SOCIAL_ICONS: Record<SocialLink["icon"], SocialIconComponent> = {
  github: GithubIcon,
  twitter: XIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

const linkColumns: Array<{
  heading: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: "#testimonials" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "DPA", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-labelledby="footer-heading"
      className="border-t border-border bg-background"
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <Container>
        <div className="grid grid-cols-1 gap-10 py-16 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground"
              aria-label={`${siteConfig.name} home`}
            >
              <Image
                src="/logo-mark.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="text-lg font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline}
            </p>

            <ul role="list" className="mt-6 flex items-center gap-2">
              {siteConfig.social.map((link) => {
                const Icon = SOCIAL_ICONS[link.icon];
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      aria-label={link.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-ring"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4"
          >
            {linkColumns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold text-foreground">
                  {col.heading}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring focus-visible:rounded"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made with care for teams that ship.</p>
        </div>
      </Container>
    </footer>
  );
}
