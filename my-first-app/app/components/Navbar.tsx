"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-5 py-5 flex justify-between items-center">
        
        <h1 className="text-xl sm:text-2xl font-bold">
          Usman Qasim
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <Link href="/" className="hover:text-blue-400">
            Home
          </Link>

          <Link href="/about" className="hover:text-blue-400">
            About
          </Link>

          <Link href="/skills" className="hover:text-blue-400">
            Skills
          </Link>

          <Link href="/projects" className="hover:text-blue-400">
            Projects
          </Link>

          <Link href="/contact" className="hover:text-blue-400">
            Contact
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link href="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>

          <Link href="/skills" onClick={() => setMenuOpen(false)}>
            Skills
          </Link>

          <Link href="/projects" onClick={() => setMenuOpen(false)}>
            Projects
          </Link>

          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}