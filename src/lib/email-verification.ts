import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 30;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getEmailVerificationSecret() {
  return process.env.NEXTAUTH_SECRET ?? "dev-email-verification-secret";
}

function hashVerificationToken(token: string) {
  return createHash("sha256")
    .update(`${token}:${getEmailVerificationSecret()}`)
    .digest("hex");
}

export function createEmailVerificationUrl(email: string, rawToken: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = new URL("/api/auth/verify-email", baseUrl);
  url.searchParams.set("email", normalizeEmail(email));
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = hashVerificationToken(rawToken);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail }
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: hashedToken,
      expires
    }
  });

  return {
    rawToken,
    expires
  };
}

export async function verifyEmailByToken(email: string, rawToken: string) {
  const normalizedEmail = normalizeEmail(email);
  const hashedToken = hashVerificationToken(rawToken);

  return prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token: hashedToken
        }
      }
    });

    if (!tokenRecord) {
      return "invalid" as const;
    }

    if (tokenRecord.expires <= new Date()) {
      await tx.verificationToken.deleteMany({
        where: {
          identifier: normalizedEmail
        }
      });
      return "expired" as const;
    }

    const updatedUser = await tx.user.updateMany({
      where: {
        email: normalizedEmail
      },
      data: {
        emailVerified: new Date()
      }
    });

    await tx.verificationToken.deleteMany({
      where: { identifier: normalizedEmail }
    });

    return updatedUser.count > 0 ? ("verified" as const) : ("invalid" as const);
  });
}

export async function sendEmailVerificationLink(email: string, verificationUrl: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (resendApiKey && emailFrom) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email,
        subject: "Verify your ShopApp email",
        html: `<p>Click to verify your email:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
      })
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(`Email delivery failed: ${reason}`);
    }
    return;
  }

  // Local fallback for development when no provider is configured.
  console.info(`[verify-email] ${email} -> ${verificationUrl}`);
}
