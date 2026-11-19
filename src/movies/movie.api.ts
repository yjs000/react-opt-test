import movies from '@/data/movies.json'
import type { Movie } from '@/movies/movie.types'

export const getMovies = async (): Promise<Movie[]> => {
  return movies
}
