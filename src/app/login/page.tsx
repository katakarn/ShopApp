import Link from "next/link";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <section className="panel stack" style={{ maxWidth: "520px", marginInline: "auto" }}>
      <h1 className="page-title">Sign in</h1>
      {params?.registered ? (
        <p className="notice" role="status" aria-live="polite">
          Account created. Please sign in.
        </p>
      ) : null}
      <LoginForm />
      <p className="muted" style={{ margin: 0 }}>
        New user? <Link href="/register">Create account</Link>
      </p>
    </section>
  );
}
