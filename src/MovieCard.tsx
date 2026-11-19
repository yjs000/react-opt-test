import type { Movie } from './movies/movie.types'

type MovieCardProps = {
  movie: Movie
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <article className="h-full rounded-2xl border border-white/10 bg-panel p-3 sm:p-4">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-poster">
        {movie.posterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt=""
            className="size-full object-cover"
          />
        )}
      </div>
      <h3 className="mt-4 font-semibold">{movie.title}</h3>
      <p className="mt-2 text-sm text-muted">
        <span className="font-semibold text-white">
          <span aria-hidden="true" className="text-amber-300">
            ★{' '}
          </span>
          <span className="sr-only">Rating </span>
          {movie.voteAverage?.toFixed(1) ?? '-'}
        </span>
        {' · '}
        {movie.originalLanguage?.toUpperCase() ?? '-'}
        {movie.releaseDate && ` · ${movie.releaseDate.slice(0, 4)}`}
      </p>
    </article>
  )
}

export default MovieCard
