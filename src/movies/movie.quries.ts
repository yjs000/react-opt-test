import { queryOptions } from '@tanstack/react-query'
import { searchMovies, type SearchMoviesParams } from './movie.api'
import { env } from '@/config/env'

export const movieSearchOptions = (params: SearchMoviesParams) =>
  queryOptions({
    queryKey: ['movie', 'search', params],
    enabled: Boolean(env.tmdbApiKey),
    queryFn: () => searchMovies(params),
  })
