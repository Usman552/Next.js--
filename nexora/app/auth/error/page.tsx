import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Sign-in error" };

const KNOWN_ERROR_CODES = [
  "verification_failed",
  "upstream_error",
  "provisioning_failed",
  "unknown",
] as const;
type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];

const SAFE_MESSAGES: Record<KnownErrorCode, string> = {
  verification_failed:
    "We could not verify your identity token. Please try signing in again.",
  upstream_error:
    "Our identity provider is having trouble right now. Please try again in a moment.",
  provisioning_failed:
    "We could not finish setting up your account. Please try again.",
  unknown: "Something went wrong while signing you in. Please try again.",
};

function normalize(code: string | undefined | null): KnownErrorCode {
  if (typeof code !== "string") return "unknown";
  const asKnown = KNOWN_ERROR_CODES.find((c) => c === code);
  return asKnown ?? "unknown";
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const safeCode = normalize(code);
  const message = SAFE_MESSAGES[safeCode];

  return (
    <main className="flex min-h-screen items-center justify-center py-24">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We couldn&rsquo;t sign you in
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="auth-error-message">
            {message}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/auth/signin">Try again</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
