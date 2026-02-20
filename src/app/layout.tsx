import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { auth } from "@/lib/auth";
import { getCartItemCount, getCurrentCart } from "@/lib/cart";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShopApp | E-commerce Demo",
    template: "%s | ShopApp"
  },
  description: "ShopApp demo storefront built with Next.js, Prisma, and NextAuth.",
  openGraph: {
    title: "ShopApp | E-commerce Demo",
    description: "Modern storefront demo with catalog, cart, checkout, orders, and admin tools.",
    type: "website",
    siteName: "ShopApp",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ShopApp storefront preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopApp | E-commerce Demo",
    description: "Modern storefront demo with catalog, cart, checkout, orders, and admin tools.",
    images: ["/twitter-image"]
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: [{ url: "/favicon.svg" }]
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, cart] = await Promise.all([auth(), getCurrentCart()]);

  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar session={session} cartCount={getCartItemCount(cart)} />
        <main id="main-content" className="container page-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
