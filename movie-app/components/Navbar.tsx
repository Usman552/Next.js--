"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch() {
    if (!search.trim()) return;

    router.push(`/search?query=${encodeURIComponent(search)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        
        <Link href="/" className="text-2xl font-bold">
          MovieApp
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>

          <Link href="/movies" className="text-sm font-medium">
            Movies
          </Link>
        </div>

        <div className="flex max-w-md flex-1 items-center gap-2">
          <Input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Button size="icon" onClick={handleSearch}>
            <Search />
          </Button>

          <ThemeToggle />
        </div>

      </div>
    </nav>
  );
}