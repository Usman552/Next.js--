import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  GitBranch,
  Lock,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Step = {
  number: number;
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
};

export type PricingTier = {
  name: string;
  price: string;
  cadence: string;
  positioning: string;
  features: string[];
  cta: string;
  ctaHref: string;
  recommended?: boolean;
};

export type Faq = {
  question: string;
  answer: string;
};

export type TrustedLogo = {
  name: string;
  src: string;
};

/* ------------------------------------------------------------------ */
/* Placeholder brand logos — replace when partner marks are available */
/* ------------------------------------------------------------------ */

export const trustedLogos: TrustedLogo[] = [
  { name: "Acme Corp", src: "/logos/acme.svg" },
  { name: "Globex", src: "/logos/globex.svg" },
  { name: "Initech", src: "/logos/initech.svg" },
  { name: "Umbrella", src: "/logos/umbrella.svg" },
  { name: "Soylent", src: "/logos/soylent.svg" },
  { name: "Wayne Enterprises", src: "/logos/wayne.svg" },
  { name: "Stark Industries", src: "/logos/stark.svg" },
  { name: "Hooli", src: "/logos/hooli.svg" },
];

export const features: Feature[] = [
  {
    title: "Unified workspace",
    description:
      "Bring roadmaps, sprints, docs, and metrics into one place — no more tab-hopping between five tools.",
    icon: Boxes,
  },
  {
    title: "Realtime collaboration",
    description:
      "Comment, mention, and iterate with your team in-context. Every change is synchronized instantly.",
    icon: Sparkles,
  },
  {
    title: "Automation that thinks",
    description:
      "Trigger workflows on any event. Route issues, update statuses, and notify the right people automatically.",
    icon: Workflow,
  },
  {
    title: "Insights out of the box",
    description:
      "Dashboards for velocity, cycle time, and DORA metrics that update as you ship — no data warehouse needed.",
    icon: BarChart3,
  },
  {
    title: "Native git integration",
    description:
      "Link commits, PRs, and deploys to work items. Ship with full traceability from idea to production.",
    icon: GitBranch,
  },
  {
    title: "Enterprise-grade security",
    description:
      "SSO, SCIM, audit logs, and granular permissions. SOC 2 Type II and GDPR compliant out of the box.",
    icon: Lock,
  },
  {
    title: "Blazing fast",
    description:
      "Sub-100ms interactions on any project size. Built on a modern architecture that scales with your team.",
    icon: Zap,
  },
];

export const steps: Step[] = [
  {
    number: 1,
    title: "Connect your stack",
    description:
      "Sign in with Google or GitHub, then plug in your existing tools — no migration weekend required.",
  },
  {
    number: 2,
    title: "Invite your team",
    description:
      "Bring in engineers, designers, and PMs with a single link. Roles and permissions are configured automatically.",
  },
  {
    number: 3,
    title: "Ship with confidence",
    description:
      "Plan sprints, track work, and measure impact — all from one interface your whole team actually wants to use.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Nexora replaced four tools in our stack. Our engineering velocity is up 34% and we finally have a single source of truth for the roadmap.",
    author: "Priya Shah",
    role: "VP of Engineering",
    company: "Northwind",
    initials: "PS",
  },
  {
    quote:
      "It's the first product tool my team asks for, not the one I have to force them to use. That alone tells you everything.",
    author: "Marcus Chen",
    role: "Head of Product",
    company: "Fieldstone",
    initials: "MC",
  },
  {
    quote:
      "We rolled Nexora out to 200 people in a week. Onboarding was so clean the training call took twelve minutes.",
    author: "Elena Rossi",
    role: "Chief of Staff",
    company: "Lumen Labs",
    initials: "ER",
  },
  {
    quote:
      "The DORA dashboards paid for the tool in the first quarter. Our exec team finally trusts the delivery numbers.",
    author: "Jordan Blake",
    role: "Director of Platform",
    company: "Helix Health",
    initials: "JB",
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "per user / month",
    positioning: "Everything a small team needs to plan and ship together.",
    features: [
      "Up to 10 users",
      "Unlimited projects",
      "Core roadmaps and sprints",
      "Community support",
    ],
    cta: "Start for free",
    ctaHref: "/auth/signin?callbackUrl=/app",
  },
  {
    name: "Pro",
    price: "$16",
    cadence: "per user / month",
    positioning:
      "For growing teams that need automation, insights, and integrations.",
    features: [
      "Unlimited users",
      "Automations and custom workflows",
      "Delivery and DORA dashboards",
      "Git, chat, and calendar integrations",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    ctaHref: "/auth/signin?callbackUrl=/app",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "billed annually",
    positioning:
      "Advanced security, compliance, and scale for larger organizations.",
    features: [
      "SSO / SAML and SCIM provisioning",
      "Advanced permissions and audit logs",
      "SOC 2 Type II report on request",
      "Dedicated customer success",
      "99.99% uptime SLA",
    ],
    cta: "Talk to sales",
    ctaHref: "/auth/signin?callbackUrl=/app",
  },
];

export const faqs: Faq[] = [
  {
    question: "How is Nexora different from the tools we already use?",
    answer:
      "Most teams stitch together a project tracker, a docs tool, a spreadsheet for metrics, and a chat integration to make it all hang together. Nexora is designed as one workspace where planning, execution, and reporting share a common data model, so you don't spend Fridays reconciling four sources of truth.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes — every paid plan includes a 14-day trial with no credit card required. The Starter plan is free forever for teams of up to 10 people.",
  },
  {
    question: "Can we migrate from Jira, Linear, or Asana?",
    answer:
      "Our importers cover Jira, Linear, Asana, ClickUp, and Trello. Most teams migrate in under an hour. For larger orgs, our onboarding team can run a white-glove migration as part of the Enterprise plan.",
  },
  {
    question: "What integrations are supported?",
    answer:
      "Nexora integrates with GitHub, GitLab, Bitbucket, Slack, Microsoft Teams, Google Calendar, Figma, Sentry, PagerDuty, and dozens more via our public API and webhooks.",
  },
  {
    question: "How do you handle security and compliance?",
    answer:
      "We're SOC 2 Type II certified, GDPR compliant, and offer SSO/SAML, SCIM provisioning, granular permissions, and full audit logs on the Enterprise plan. All data is encrypted in transit and at rest.",
  },
  {
    question: "Do you have an on-premises option?",
    answer:
      "Enterprise customers can deploy Nexora in a dedicated single-tenant cloud environment. A fully self-hosted option is on our roadmap — contact sales if this is a hard requirement.",
  },
  {
    question: "How does per-user pricing work?",
    answer:
      "You're billed monthly or annually for active users. Guests and read-only viewers are free. You can add or remove seats at any time and we'll prorate the change.",
  },
  {
    question: "Can I cancel any time?",
    answer:
      "Absolutely — there are no long-term contracts on the Starter or Pro plans. Cancel from your workspace settings and your subscription ends at the close of the current billing period.",
  },
];
