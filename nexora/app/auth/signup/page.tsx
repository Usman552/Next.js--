import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container>
        <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-primary hover:underline focus-ring"
            >
              ← Back to {siteConfig.name}
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with an email and password. You can add Google or GitHub
              later.
            </p>
          </div>

          <SignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline focus-ring"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
