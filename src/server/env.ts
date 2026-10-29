import { z } from "zod";

const list = (lower: boolean) =>
  z
    .string()
    .optional()
    .transform((s) =>
      (s ?? "")
        .split(",")
        .map((x) => (lower ? x.trim().toLowerCase() : x.trim()))
        .filter(Boolean),
    );

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // 既定は oidc。dev（開発用ログイン）は明示した時だけ、かつ本番では拒否する。
    AUTH_MODE: z.enum(["oidc", "dev"]).default("oidc"),
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
    APP_URL: z.string().url().optional(),
    OIDC_ISSUER: z.string().url().optional(),
    OIDC_CLIENT_ID: z.string().min(1).optional(),
    OIDC_CLIENT_SECRET: z.string().min(1).optional(),
    OIDC_SCOPES: z.string().default("openid email profile"),
    DATABASE_URL: z.string().min(1).optional(),
    ADMIN_EMAILS: list(true),
    MANAGER_EMAILS: list(true),
    ALLOWED_EMAIL_DOMAINS: list(true),
  })
  .superRefine((e, ctx) => {
    const prod = e.NODE_ENV === "production";
    if (prod && e.AUTH_MODE === "dev") ctx.addIssue({ code: "custom", message: "AUTH_MODE=dev is not allowed in production" });
    if (e.AUTH_MODE === "oidc") {
      for (const k of ["OIDC_ISSUER", "OIDC_CLIENT_ID", "OIDC_CLIENT_SECRET", "APP_URL"] as const) {
        if (!e[k]) ctx.addIssue({ code: "custom", message: `${k} is required when AUTH_MODE=oidc`, path: [k] });
      }
    }
    if (prod) {
      if (!e.DATABASE_URL) ctx.addIssue({ code: "custom", message: "DATABASE_URL is required in production", path: ["DATABASE_URL"] });
      for (const k of ["APP_URL", "OIDC_ISSUER"] as const) {
        if (e[k] && !e[k]!.startsWith("https://")) ctx.addIssue({ code: "custom", message: `${k} must use https in production`, path: [k] });
      }
    }
  });

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v.trim() !== ""));
  const r = schema.safeParse(cleaned);
  if (!r.success) throw new Error("Invalid configuration: " + r.error.issues.map((i) => i.message).join("; "));
  return r.data;
}

let cached: Env | undefined;
export function env(): Env {
  return (cached ??= parseEnv(process.env));
}
