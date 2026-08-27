import { NavAuthSlot } from "@/components/auth/nav-auth-slot";
import { Navbar } from "@/components/sections/navbar";
import { requireSession } from "@/lib/auth/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession("/app");

  return (
    <>
      <Navbar rightSlot={<NavAuthSlot />} />
      <main id="main" className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
}
