"use client";

import { useEffect, useRef, useState } from "react";
import { SearchX, TriangleAlert } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { useSearch } from "@/context/SearchContext";
import type { Movie } from "@/types/movie";

interface MoviesExplorerProps {
  initialMovies: Movie[];
  initialError: string | null;
}

export default function MoviesExplorer({
  initialMovies,
  initialError,
}: MoviesExplorerProps) {
  const { query } = useSearch();
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  // The very first render already has the server-fetched trending
  // list, so skip re-fetching it the moment this component mounts.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    let cancelled = false;

    async function loadMovies() {
      setLoading(true);
      setError(null);

      try {
        const url = query
          ? `/api/movies?query=${encodeURIComponent(query)}`
          : "/api/movies";

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        if (!cancelled) {
          setMovies(data.results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <section>
      <div className="mb-6">
        {query ? (
          <>
            <h1 className="text-3xl font-bold">Search Results</h1>
            <p className="mt-1 text-muted-foreground">
              Showing results for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </p>
          </>
        ) : (
          <h1 className="text-3xl font-bold">🔥 Trending Movies</h1>
        )}
      </div>

      {loading && <MovieGridSkeleton />}

      {!loading && error && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <TriangleAlert className="size-8" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <SearchX className="size-8" />
          <p>No movies found{query && <> for &ldquo;{query}&rdquo;</>}.</p>
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              poster={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/no-poster.jpg"
              }
              year={
                movie.release_date ? movie.release_date.slice(0, 4) : "N/A"
              }
              rating={movie.vote_average}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <div className="aspect-[2/3] animate-pulse bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
