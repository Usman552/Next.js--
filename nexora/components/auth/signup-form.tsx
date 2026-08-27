"use client";

import { useActionState } from "react";

import { signupAction, type SignupState } from "@/app/auth/signup/actions";
import { Button } from "@/components/ui/button";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          defaultValue={state.values?.name ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "signup-name-error" : undefined}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus-ring"
        />
        {state.fieldErrors?.name ? (
          <span id="signup-name-error" className="text-xs text-destructive">
            {state.fieldErrors.name}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "signup-email-error" : undefined}
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus-ring"
        />
        {state.fieldErrors?.email ? (
          <span id="signup-email-error" className="text-xs text-destructive">
            {state.fieldErrors.email}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password
              ? "signup-password-error"
              : "signup-password-hint"
          }
          className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus-ring"
        />
        {state.fieldErrors?.password ? (
          <span id="signup-password-error" className="text-xs text-destructive">
            {state.fieldErrors.password}
          </span>
        ) : (
          <span id="signup-password-hint" className="text-xs text-muted-foreground">
            At least 8 characters, with a letter and a number.
          </span>
        )}
      </label>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
