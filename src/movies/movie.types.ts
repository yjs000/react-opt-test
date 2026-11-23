// src/movies/movie.types.ts
export const MOVIE_SORT_OPTIONS = [
  { value: 'original', label: '기본순' },
  { value: 'title', label: '제목순 (오름차순)' },
  { value: 'rating', label: '평점순 (높은 순)' },
] as const

export type MovieSort = (typeof MOVIE_SORT_OPTIONS)[number]['value']

export type Movie = {
  id: number
  title: string
  posterPath: string | null
  voteAverage?: number
  originalLanguage?: string
  releaseDate?: string
}
