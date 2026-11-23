import type { Movie, MovieSort } from './movie.types'

const compareMoviesBySort: Record<
  MovieSort,
  ((a: Movie, b: Movie) => number) | null
> = {
  original: null,
  title: (a, b) => a.title.localeCompare(b.title, 'en'),
  rating: (a, b) => (b.voteAverage ?? -1) - (a.voteAverage ?? -1),
}

export const sortMovies = (movies: Movie[], sortBy: MovieSort): Movie[] => {
  const compareMovies = compareMoviesBySort[sortBy]
  return compareMovies === null ? movies : movies.toSorted(compareMovies)
}
