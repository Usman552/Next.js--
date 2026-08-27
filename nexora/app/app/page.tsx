import { Container } from "@/components/ui/container";
import { getSession } from "@/lib/auth/server";

export const metadata = { title: "Dashboard" };

export default async function AppHomePage() {
  const session = await getSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "there";

  return (
    <section aria-labelledby="app-home-heading" className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="app-home-heading"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Hello, {displayName}
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground">
            You&rsquo;re signed in. This is a placeholder landing for the
            authenticated app — future features will live here.
          </p>
        </div>
      </Container>
    </section>
  );
}
