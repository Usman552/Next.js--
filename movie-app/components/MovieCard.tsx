import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface MovieCardProps {
  id: number;
  title: string;
  poster: string;
  year: string;
  rating?: number;
}

export default function MovieCard({
  id,
  title,
  poster,
  year,
  rating,
}: MovieCardProps) {
  return (
    <Link
     href={`/movie?id=${id}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <Image
          src={poster}
          alt={title}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {typeof rating === "number" && rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="truncate text-lg font-semibold" title={title}>
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">{year}</p>
      </div>
    </Link>
  );
}
