import Link from "next/link";

import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";

/**
 * Server Component. Rendered inside `<Navbar rightSlot={...} />` — the
 * authenticated app layout. Reads the session server-side and returns the
 * appropriate right-side nav controls.
 */
export async function NavAuthSlot() {
  const session = await getSession();

  if (!session?.user) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/auth/signin?callbackUrl=/app">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup?callbackUrl=/app">Get started</Link>
        </Button>
      </>
    );
  }

  return (
    <UserMenu
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
    />
  );
}
