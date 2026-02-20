"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
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

    setIsPending(false);

    if (!result || result.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = result.url ?? "/";
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
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
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
