import { Header } from '@/Header'
import { useQuery } from '@tanstack/react-query'
import MovieCard from '@/MovieCard'
import { movieListOptions } from '@/movies/movie.quries'
import SearchBar from './SearchBar'
import { useEffect, useMemo, useState } from 'react'
import {
  MOVIE_SORT_OPTIONS,
  type Movie,
  type MovieSort,
} from '@/movies/movie.types'
import { sortMovies } from '@/movies/movie.utils'
import MovieList from './MovieList'

const INITIAL_SEARCH_TERM = 't'
const EMPTY_MOVIES: Movie[] = []

type SortCache = {
  source: Movie[]
  results: ReadonlyMap<MovieSort, Movie[]>
}

const MovieBoard = () => {
  const [searchTerm, setSearchTerm] = useState(INITIAL_SEARCH_TERM)
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(INITIAL_SEARCH_TERM)
  const [sortBy, setSortBy] = useState<MovieSort>('original')
  const [sortCache, setSortCache] = useState<SortCache | null>(null)

  const { data: movies = EMPTY_MOVIES } = useQuery(movieListOptions())

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearchTerm(searchTerm),
      150,
    )
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const filteredMovies = useMemo(() => {
    const query = debouncedSearchTerm.toLowerCase()
    return movies.filter((movie) => movie.title.toLowerCase().includes(query))
  }, [movies, debouncedSearchTerm])

  const cachedMovies =
    sortCache?.source === filteredMovies
      ? (sortCache.results.get(sortBy) ?? null)
      : null
  const sortedMovies = useMemo(
    () => cachedMovies ?? sortMovies(filteredMovies, sortBy),
    [cachedMovies, filteredMovies, sortBy],
  )

  function onChangeSortBy(value: string) {
    const option = MOVIE_SORT_OPTIONS.find((option) => option.value === value)
    if (!option || option.value === sortBy) return

    if (sortBy !== 'original' && cachedMovies === null) {
      setSortCache((previous) => {
        const results =
          previous?.source === filteredMovies
            ? new Map(previous.results)
            : new Map<MovieSort, Movie[]>()

        results.set(sortBy, sortedMovies)
        return { source: filteredMovies, results }
      })
    }

    setSortBy(option.value)
  }

  return (
    <main className="min-h-screen bg-canvas text-white [color-scheme:dark]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-8 sm:pt-20">
        <Header />
        <SearchBar searchTerm={searchTerm} onChangeSearchTerm={setSearchTerm} />
        <section aria-labelledby="movies-heading" className="mt-10">
          <h2 id="movies-heading" className="text-2xl font-bold sm:text-3xl">
            All Movies
          </h2>
          <label className="mt-4 flex items-center gap-3 text-sm text-muted">
            정렬
            <select
              value={sortBy}
              onChange={(event) => onChangeSortBy(event.currentTarget.value)}
              className="rounded-lg border border-white/10 bg-panel px-3 py-2 text-white"
            >
              {MOVIE_SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <MovieList movies={sortedMovies} />
        </section>
      </div>
    </main>
  )
}

export default MovieBoard
