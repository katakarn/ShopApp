"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  hasGoogleAuth: boolean;
};

export function LoginForm({ hasGoogleAuth }: LoginFormProps) {
  const [isCredentialsPending, setIsCredentialsPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [error, setError] = useState("");
  const isPending = isCredentialsPending || isGooglePending;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCredentialsPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/?flash=signed-in",
      redirect: false
    });

    setIsCredentialsPending(false);

    if (!result) {
      setError("Unable to sign in right now. Please try again.");
      return;
    }

    if (result.error === "EmailNotVerified") {
      window.location.href = `/verify-email/sent?email=${encodeURIComponent(email)}`;
      return;
    }

    if (result.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = result.url ?? "/";
  }

  async function onGoogleSignIn() {
    setError("");
    setIsGooglePending(true);

    try {
      await signIn("google", { callbackUrl: "/?flash=signed-in" });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setIsGooglePending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {hasGoogleAuth ? (
        <>
          <button
            type="button"
            className="btn btn-outline btn-google"
            onClick={onGoogleSignIn}
            disabled={isPending}
          >
            <span className="google-mark" aria-hidden="true">
              G
            </span>
            {isGooglePending ? "Connecting to Google..." : "Continue with Google"}
          </button>
          <div className="auth-divider" aria-hidden="true">
            <span>or use email</span>
          </div>
        </>
      ) : null}

      <label>
        Email
        <input name="email" type="email" required placeholder="you@example.com" />
      </label>

      <label>
        Password
        <input name="password" type="password" required minLength={6} placeholder="******" />
      </label>

      {error ? (
        <p className="error-text" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      <button className="btn" type="submit" disabled={isPending}>
        {isCredentialsPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
