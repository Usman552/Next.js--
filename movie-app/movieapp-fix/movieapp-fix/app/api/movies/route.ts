import { NextRequest, NextResponse } from "next/server";
import { getTrendingMovies, searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  try {
    const data = query ? await searchMovies(query) : await getTrendingMovies();
    return NextResponse.json({ results: data.results ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
