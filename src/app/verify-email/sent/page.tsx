import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { resendVerificationEmailAction } from "@/lib/actions";

type VerifyEmailSentPageProps = {
  searchParams?: Promise<{
    email?: string;
    resent?: string;
    delivery?: string;
    error?: string;
    devLink?: string;
  }>;
};

export default async function VerifyEmailSentPage({ searchParams }: VerifyEmailSentPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const email = params?.email;
  const devLink = params?.devLink;

  return (
    <section className="panel stack" style={{ maxWidth: "620px", marginInline: "auto" }}>
      <h1 className="page-title">Verify your email</h1>

      {params?.error === "invalid" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Please provide a valid email address.
        </p>
      ) : null}

      {params?.resent ? (
        <p className="notice" role="status" aria-live="polite">
          Verification link sent again.
        </p>
      ) : null}

      {params?.delivery === "failed" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Email delivery failed. Please retry.
        </p>
      ) : null}

      <p className="muted" style={{ margin: 0 }}>
        We sent a verification link to <strong>{email ?? "your email address"}</strong>. Open your inbox and click
        the link to activate your account.
      </p>

      {email ? (
        <form action={resendVerificationEmailAction} className="auth-form">
          <input type="hidden" name="email" value={email} />
          <SubmitButton className="btn btn-outline">Resend verification email</SubmitButton>
        </form>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          Return to register to try again.
        </p>
      )}

      {devLink ? (
        <div className="notice" role="status" aria-live="polite">
          Development mode:{" "}
          <a href={devLink} style={{ textDecoration: "underline" }}>
            Verify now
          </a>
        </div>
      ) : null}

      <p className="muted" style={{ margin: 0 }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </section>
  );
}
