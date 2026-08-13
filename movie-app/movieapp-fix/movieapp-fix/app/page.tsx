import MoviesExplorer from "@/components/MoviesExplorer";
import { getTrendingMovies } from "@/lib/tmdb";
import type { Movie } from "@/types/movie";

export default async function Home() {
  let initialMovies: Movie[] = [];
  let initialError: string | null = null;

  try {
    const data = await getTrendingMovies();
    initialMovies = data.results;
  } catch (err) {
    initialError = err instanceof Error ? err.message : "Something went wrong.";
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <MoviesExplorer initialMovies={initialMovies} initialError={initialError} />
    </main>
  );
}
