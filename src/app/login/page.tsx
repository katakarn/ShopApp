import Link from "next/link";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{ registered?: string; verified?: string; error?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const hasGoogleAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <section className="panel stack" style={{ maxWidth: "520px", marginInline: "auto" }}>
      <h1 className="page-title">Sign in</h1>
      {params?.registered ? (
        <p className="notice" role="status" aria-live="polite">
          Account created. Please sign in.
        </p>
      ) : null}
      {params?.verified ? (
        <p className="notice" role="status" aria-live="polite">
          Email verified. You can sign in now.
        </p>
      ) : null}
      {params?.error === "verify-expired" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Verification link expired.{" "}
          <Link href={`/verify-email/sent?email=${encodeURIComponent(params?.email ?? "")}`}>Request a new one</Link>.
        </p>
      ) : null}
      {params?.error === "verify-invalid" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Verification link is invalid.
        </p>
      ) : null}
      {params?.error && params.error !== "verify-expired" && params.error !== "verify-invalid" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Sign-in failed. Please try again.
        </p>
      ) : null}
      <LoginForm hasGoogleAuth={hasGoogleAuth} />
      <p className="muted" style={{ margin: 0 }}>
        New user? <Link href="/register">Create account</Link>
      </p>
    </section>
  );
}
