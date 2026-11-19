import { queryOptions } from '@tanstack/react-query'
import { getMovies } from './movie.api'

export const movieListOptions = () =>
  queryOptions({
    queryKey: ['movies', 'list'],
    queryFn: getMovies,
  })
