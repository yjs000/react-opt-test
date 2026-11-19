export type TmdbMovie = {
  id: number
  title: string
  vote_average?: number
  original_language?: string
  release_date?: string
}

export type TmdbSearchResponse = {
  results: TmdbMovie[]
}
