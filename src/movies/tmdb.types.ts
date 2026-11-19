// src/movies/tmdb.types.ts
export type TmdbMovie = {
  id: number
  title: string
  vote_average?: number
  original_language?: string
  release_date?: string
  poster_path: string | null
}

export type TmdbSearchResponse = {
  page: number
  results: TmdbMovie[]
  total_pages: number
  total_results: number
}
