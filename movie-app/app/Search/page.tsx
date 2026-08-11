import MovieCard from "@/components/MovieCard";

type Movie = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
};

type SearchResponse = {
  results: Movie[];
};

async function searchMovies(query: string): Promise<SearchResponse> {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      query
    )}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.status_message || "Failed to search movies");
  }

  return data;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query || "";

  const data = query
    ? await searchMovies(query)
    : { results: [] };

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">
        Search Results
      </h1>

      {query && (
        <p className="mb-6 text-muted-foreground">
          Results for: <span className="font-semibold">{query}</span>
        </p>
      )}

      {data.results.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.results.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              poster={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/no-poster.jpg"
              }
              year={
                movie.release_date
                  ? movie.release_date.slice(0, 4)
                  : "N/A"
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}