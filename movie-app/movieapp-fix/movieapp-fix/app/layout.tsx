import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { SearchProvider } from "@/context/SearchContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MovieApp",
  description: "Discover trending movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SearchProvider>
            <Navbar />
            {children}
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}