"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

type Props = {
  callbackUrl?: string;
  defaultEmail?: string;
};

export function CredentialsSignInForm({ callbackUrl = "/app", defaultEmail }: Props) {
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    // `signIn` with `redirect: true` (default) handles the full server-side
    // redirect chain including the callback URL and error mapping. On failure
    // Auth.js redirects back to /auth/signin?error=CredentialsSignin (mapped
    // to a human message by app/auth/signin/page.tsx).
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      callbackUrl,
    });
    // If Auth.js does not redirect (unusual), release the pending state.
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail ?? ""}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus-ring"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus-ring"
        />
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
