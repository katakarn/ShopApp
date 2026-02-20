"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type AuthButtonsProps = {
  isLoggedIn: boolean;
  userName: string | null | undefined;
};

export function AuthButtons({ isLoggedIn, userName }: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <div className="auth-group">
        <span className="muted">{userName ?? "Account"}</span>
        <button
          type="button"
          className="btn btn-outline"
          aria-label="Sign out"
          onClick={() => signOut({ callbackUrl: "/?flash=signed-out" })}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="btn btn-outline" aria-label="Sign in">
      Sign in
    </Link>
  );
}
