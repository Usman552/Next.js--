"use client";

import { signIn } from "next-auth/react";

import { GithubIcon } from "@/components/icons/social";
import { Button } from "@/components/ui/button";

type Props = {
  callbackUrl?: string;
  /**
   * Whether the Google button should render. MUST be passed from a Server
   * Component that read `env.GOOGLE_ENABLED` — this Client Component MUST
   * NOT import `@/lib/env` (which reads `process.env` and blows up in the
   * browser where DATABASE_URL etc. don't exist).
   */
  googleEnabled: boolean;
  githubEnabled: boolean;
};

export function OAuthSignInButtons({
  callbackUrl = "/app",
  googleEnabled,
  githubEnabled,
}: Props) {
  if (!googleEnabled && !githubEnabled) return null;

  return (
    <div className="flex flex-col gap-2">
      {googleEnabled ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full"
        >
          <GoogleGlyph className="h-5 w-5" aria-hidden="true" />
          Continue with Google
        </Button>
      ) : null}
      {githubEnabled ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => signIn("github", { callbackUrl })}
          className="w-full"
        >
          <GithubIcon className="h-5 w-5" aria-hidden="true" />
          Continue with GitHub
        </Button>
      ) : null}
    </div>
  );
}

function GoogleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M21.6 12.227c0-.68-.06-1.34-.17-1.97H12v3.727h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.277Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.9c-.2-.6-.32-1.24-.32-1.9 0-.66.12-1.3.32-1.9V7.52H3.05A10 10 0 0 0 2 12c0 1.6.38 3.12 1.05 4.48L6.4 13.9Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.02c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.95 3.04 14.7 2 12 2A10 10 0 0 0 3.05 7.52L6.4 10.1c.8-2.36 3-4.08 5.6-4.08Z"
        fill="#EA4335"
      />
    </svg>
  );
}
