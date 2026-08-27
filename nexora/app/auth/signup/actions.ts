"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isErr } from "@/lib/result";
import { userService } from "@/services/users/user.service";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((v) => /[a-zA-Z]/.test(v), "Password must contain a letter")
    .refine((v) => /\d/.test(v), "Password must contain a number"),
});

export type SignupState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
  values?: {
    name?: string;
    email?: string;
  };
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: NonNullable<SignupState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "password" | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      fieldErrors,
      values: { name: raw.name, email: raw.email },
    };
  }

  const result = await userService.createCredentialsUser(parsed.data);
  if (isErr(result)) {
    if (result.error.code === "conflict") {
      return {
        fieldErrors: { email: result.error.message },
        values: { name: raw.name, email: raw.email },
      };
    }
    return {
      error: "Something went wrong. Please try again.",
      values: { name: raw.name, email: raw.email },
    };
  }

  // Signup succeeded — send to sign-in with the email pre-filled.
  const url = `/auth/signin?signup=success&email=${encodeURIComponent(parsed.data.email)}`;
  redirect(url);
}
