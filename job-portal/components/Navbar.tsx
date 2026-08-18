"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full border-b border-border bg-background text-foreground">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div>
          <h2 className="text-xl font-bold">Jobs</h2>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>

          <Link href="#" className="hover:text-primary">
            Jobs
          </Link>

          <Link href="#" className="hover:text-primary">
            About Us
          </Link>

          <Link href="#" className="hover:text-primary">
            Contact Us
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <AuthButtons />
          <ThemeToggle />
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>

            <Link href="#" onClick={() => setIsOpen(false)}>
              Jobs
            </Link>

            <Link href="#" onClick={() => setIsOpen(false)}>
              About Us
            </Link>

            <Link href="#" onClick={() => setIsOpen(false)}>
              Contact Us
            </Link>

            <div className="pt-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;