// src/movies/movie.types.ts
export type MovieSort = 'original' | 'title' | 'rating'

export type Movie = {
  id: number
  title: string
  posterPath: string | null
  voteAverage?: number
  originalLanguage?: string
  releaseDate?: string
}
