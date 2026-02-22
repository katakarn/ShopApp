import { NextResponse } from "next/server";
import { verifyEmailByToken } from "@/lib/email-verification";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");

  const loginUrl = new URL("/login", url.origin);

  if (!email || !token) {
    loginUrl.searchParams.set("error", "verify-invalid");
    return NextResponse.redirect(loginUrl);
  }

  const result = await verifyEmailByToken(email, token);

  if (result === "verified") {
    loginUrl.searchParams.set("verified", "1");
    return NextResponse.redirect(loginUrl);
  }

  if (result === "expired") {
    loginUrl.searchParams.set("error", "verify-expired");
    loginUrl.searchParams.set("email", email);
    return NextResponse.redirect(loginUrl);
  }

  loginUrl.searchParams.set("error", "verify-invalid");
  return NextResponse.redirect(loginUrl);
}
