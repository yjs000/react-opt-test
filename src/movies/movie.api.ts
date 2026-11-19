import tmdbGet from '@/api/tmdb'
import type { TmdbMovie, TmdbSearchResponse } from '@/movies/tmdb.types'
import type { Movie } from './movie.types'

export type SearchMoviesParams = {
  searchTerm: string
}

const toMovie = (movie: TmdbMovie): Movie => {
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    voteAverage: movie.vote_average,
    originalLanguage: movie.original_language,
    releaseDate: movie.release_date,
  }
}

export const searchMovies = async ({
  searchTerm,
}: SearchMoviesParams): Promise<Movie[]> => {
  const response = await tmdbGet<TmdbSearchResponse>('search/movie', {
    query: searchTerm,
  })
  return await response.results.map(toMovie)
}
