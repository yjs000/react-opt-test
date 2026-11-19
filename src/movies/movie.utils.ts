import type { Movie, MovieSort } from './movie.types'

export const sortMovies = (movies: Movie[], sortBy: MovieSort): Movie[] => {
  if (sortBy === 'original') return movies

  return movies.toSorted((a, b) =>
    sortBy === 'title'
      ? a.title.localeCompare(b.title, 'en')
      : (b.voteAverage ?? -1) - (a.voteAverage ?? -1),
  )
}
