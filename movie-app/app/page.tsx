import MovieCard from "@/components/MovieCard";

type Movie = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
};

type MoviesResponse = {
  results: Movie[];
};

async function getMovies() {
  const token = process.env.TMDB_ACCESS_TOKEN;

  console.log("Token exists:", !!token);
  console.log("Token length:", token?.length);

  const res = await fetch("https://api.themoviedb.org/3/trending/movie/week", {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  const data = await res.json();

  console.log("TMDB response:", data);

  if (!res.ok) {
    throw new Error(data.status_message || "TMDB request failed");
  }

  return data;
}

export default async function Home() {
  const data = await getMovies();

  return (
    <main className="container mx-auto px-4 py-10">
      <section>
        <h1 className="mb-6 text-3xl font-bold">🔥 Trending Movies</h1>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.results.map((movie: Movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              poster={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/no-poster.jpg"
              }
              year={movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
