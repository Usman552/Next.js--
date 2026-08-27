export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "github" | "twitter" | "linkedin" | "youtube";
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  nav: NavLink[];
  social: SocialLink[];
};

export const siteConfig: SiteConfig = {
  name: "Nexora",
  tagline: "The operating system for modern product teams.",
  description:
    "Nexora is an all-in-one platform that unifies planning, delivery, and insights so product teams ship better software, faster.",
  url: "https://nexora.example.com",
  ogImage: "/og.svg",
  nav: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/", icon: "github" },
    { label: "Twitter / X", href: "https://twitter.com/", icon: "twitter" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
  ],
};
