import "server-only";

import { z } from "zod";

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  });

// OAuth pairs are validated as "both-or-neither" — a provider is enabled only
// when both id and secret are present. Empty strings are treated as unset.
const optionalNonEmpty = z
  .string()
  .transform((v) => (v.trim() === "" ? undefined : v))
  .optional();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: z.string().min(1, {
      message: "must be a non-empty connection string",
    }),
    DIRECT_URL: z.string().min(1).optional(),

    AUTH_SECRET: z
      .string()
      .min(32, { message: "must be at least 32 characters long" }),
    AUTH_URL: z.string().url({ message: "must be a fully-qualified URL" }),

    GOOGLE_CLIENT_ID: optionalNonEmpty,
    GOOGLE_CLIENT_SECRET: optionalNonEmpty,
    GITHUB_CLIENT_ID: optionalNonEmpty,
    GITHUB_CLIENT_SECRET: optionalNonEmpty,

    AUTH_LOGOUT_FEDERATED: booleanFromString.default(false),
  })
  .transform((values) => ({
    ...values,
    DIRECT_URL: values.DIRECT_URL ?? values.DATABASE_URL,
    GOOGLE_ENABLED: Boolean(
      values.GOOGLE_CLIENT_ID && values.GOOGLE_CLIENT_SECRET
    ),
    GITHUB_ENABLED: Boolean(
      values.GITHUB_CLIENT_ID && values.GITHUB_CLIENT_SECRET
    ),
  }))
  .superRefine((values, ctx) => {
    // Both-or-neither for each OAuth pair.
    if (
      Boolean(values.GOOGLE_CLIENT_ID) !== Boolean(values.GOOGLE_CLIENT_SECRET)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set (or both unset)",
        path: ["GOOGLE_CLIENT_ID"],
      });
    }
    if (
      Boolean(values.GITHUB_CLIENT_ID) !== Boolean(values.GITHUB_CLIENT_SECRET)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must both be set (or both unset)",
        path: ["GITHUB_CLIENT_ID"],
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => {
      const key = issue.path.join(".") || "(root)";
      return `${key}: ${issue.message}`;
    })
    .join("; ");
}

function parseEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables: ${formatIssues(parsed.error.issues)}`
    );
  }
  return parsed.data;
}

export const env: AppEnv = parseEnv();
