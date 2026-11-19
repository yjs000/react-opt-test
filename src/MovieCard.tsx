import type { TmdbMovie } from './movies/tmdb.types'

function MovieCard({ title }: TmdbMovie) {
  console.log(title)
  return (
    <article className="h-full rounded-2xl border border-white/10 bg-panel p-3 sm:p-4">
      <div aria-hidden="true" className="aspect-[2/3] rounded-lg bg-poster" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted">
        <span className="font-semibold text-white">
          <span aria-hidden="true" className="text-amber-300">
            ★{' '}
          </span>
          <span className="sr-only">Rating </span>
          {'rating'}
        </span>
        {' · '}
        {'language'}
        {' · '}
        {'year'}
      </p>
    </article>
  )
}

export default MovieCard
