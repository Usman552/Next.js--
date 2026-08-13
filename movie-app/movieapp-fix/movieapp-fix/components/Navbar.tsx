"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Clapperboard } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchContext";

export default function Navbar() {
  const [input, setInput] = useState("");
  const { setQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();

  function runSearch() {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Search results render inline on the home page, so make sure
    // we're actually looking at it instead of jumping to a new route.
    if (pathname !== "/") router.push("/");

    setQuery(trimmed);
  }

  function clearSearch() {
    setInput("");
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runSearch();
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 sm:gap-6">
        <Link
          href="/"
          onClick={clearSearch}
          className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
        >
          <Clapperboard className="size-6 text-primary" />
          <span className="hidden sm:inline">MovieApp</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            onClick={clearSearch}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>

        <div className="relative ml-auto flex max-w-md flex-1 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={runSearch}
            aria-label="Search"
            className="absolute left-1 text-muted-foreground hover:text-foreground"
          >
            <Search />
          </Button>

          <Input
            type="text"
            placeholder="Search movies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 rounded-full pl-9 pr-9"
          />

          {input && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-1 text-muted-foreground hover:text-foreground"
            >
              <X />
            </Button>
          )}
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
