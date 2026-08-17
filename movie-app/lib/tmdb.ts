import type { MovieResponse, MovieDetails } from "@/types/movie";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(path: string): Promise<T> {
const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;

  const res = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.status_message || "TMDB request failed");
  }

  return data as T;
}

export function getTrendingMovies() {
  return tmdbFetch<MovieResponse>("/trending/movie/week");
}

export function searchMovies(query: string) {
  return tmdbFetch<MovieResponse>(`/search/movie?query=${encodeURIComponent(query)}`);
}

export function getMovieDetails(id: string) {
  return tmdbFetch<MovieDetails>(`/movie/${id}`);
}
