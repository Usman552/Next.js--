import Link from "next/link";

import { CredentialsSignInForm } from "@/components/auth/credentials-signin-form";
import { OAuthSignInButtons } from "@/components/auth/oauth-signin-buttons";
import { Container } from "@/components/ui/container";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

type SearchParams = {
  callbackUrl?: string;
  error?: string;
  signup?: string;
  email?: string;
};

const AUTH_JS_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email or password is incorrect.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  AccessDenied: "Access denied. Please try again.",
  Configuration: "Sign-in is misconfigured. Please contact support.",
  Verification: "We could not verify that link.",
};

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { callbackUrl = "/app", error, signup, email } = await searchParams;
  const errorMessage = error ? AUTH_JS_ERROR_MESSAGES[error] : undefined;
  const successMessage =
    signup === "success"
      ? "Account created — sign in below to continue."
      : undefined;

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
              Sign in to {siteConfig.name}
            </h1>
          </div>

          {successMessage ? (
            <p
              role="status"
              className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary"
            >
              {successMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          <OAuthSignInButtons
            callbackUrl={callbackUrl}
            googleEnabled={env.GOOGLE_ENABLED}
            githubEnabled={env.GITHUB_ENABLED}
          />

          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or continue with email</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <CredentialsSignInForm
            callbackUrl={callbackUrl}
            defaultEmail={email}
          />

          <p className="text-center text-sm text-muted-foreground">
            Don&rsquo;t have an account?{" "}
            <Link
              href={`/auth/signup${
                callbackUrl && callbackUrl !== "/app"
                  ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : ""
              }`}
              className="font-medium text-primary hover:underline focus-ring"
            >
              Create one
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
