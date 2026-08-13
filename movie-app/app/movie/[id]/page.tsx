import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMovieDetails } from "@/lib/tmdb";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { id } = await params;

  const movie = await getMovieDetails(id).catch(() => null);

  if (!movie) {
    notFound();
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-poster.jpg";

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

  const runtimeLabel = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <main>
      <div className="relative h-[38vh] min-h-[240px] w-full overflow-hidden bg-muted sm:h-[45vh]">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-sm font-medium backdrop-blur-md transition-colors hover:bg-background"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <div className="container mx-auto -mt-20 px-4 pb-12 sm:-mt-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl border-4 border-background bg-muted shadow-xl sm:w-52">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="pb-2">
            <h1 className="text-2xl font-bold sm:text-4xl">{movie.title}</h1>
            {movie.tagline && (
              <p className="mt-1 italic text-muted-foreground">
                {movie.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-medium">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            {movie.vote_average.toFixed(1)}
            <span className="text-muted-foreground">
              ({movie.vote_count})
            </span>
          </span>

          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-4" />
            {year}
          </span>

          {runtimeLabel && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-4" />
              {runtimeLabel}
            </span>
          )}

          {movie.genres.map((genre) => (
            <span
              key={genre.id}
              className="rounded-full border px-3 py-1 text-muted-foreground"
            >
              {genre.name}
            </span>
          ))}
        </div>

        <Card className="mt-8 max-w-3xl">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-muted-foreground">
              {movie.overview || "No overview available."}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
