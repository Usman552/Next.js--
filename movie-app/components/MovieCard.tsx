import Image from "next/image";

interface MovieCardProps {
  title: string;
  poster: string;
  year: string;
}

export default function MovieCard({
  title,
  poster,
  year,
}: MovieCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-[2/3]">
        <Image
          src={poster}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h2 className="truncate text-lg font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {year}
        </p>
      </div>
    </div>
  );
}