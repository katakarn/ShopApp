import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { registerUserAction } from "@/lib/actions";

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <section className="panel stack" style={{ maxWidth: "520px", marginInline: "auto" }}>
      <h1 className="page-title">Create account</h1>
      {params?.error === "exists" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Email already exists.
        </p>
      ) : null}
      {params?.error === "invalid" ? (
        <p className="error-text" role="alert" aria-live="assertive">
          Please review your input.
        </p>
      ) : null}

      <form action={registerUserAction} className="auth-form">
        <label>
          Name
          <input name="name" required minLength={2} />
        </label>

        <label>
          Email
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input name="password" type="password" required minLength={6} />
        </label>

        <label>
          Confirm password
          <input name="confirmPassword" type="password" required minLength={6} />
        </label>

        <SubmitButton className="btn">Create account</SubmitButton>
      </form>

      <p className="muted" style={{ margin: 0 }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
