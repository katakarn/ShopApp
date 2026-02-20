import Link from "next/link";
import type { Session } from "next-auth";
import { AuthButtons } from "@/components/auth-buttons";

type NavbarProps = {
  session: Session | null;
  cartCount: number;
};

export function Navbar({ session, cartCount }: NavbarProps) {
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="logo">
          ShopApp
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <Link href="/">Shop</Link>
          <Link href="/cart">Cart ({cartCount})</Link>
          {session?.user ? <Link href="/orders">Orders</Link> : null}
          {isAdmin ? <Link href="/admin">Admin</Link> : null}
        </nav>

        <AuthButtons isLoggedIn={Boolean(session?.user)} userName={session?.user?.name} />
      </div>
    </header>
  );
}
