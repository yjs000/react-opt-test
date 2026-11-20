import { Header } from '@/Header'
import { useQuery } from '@tanstack/react-query'
import MovieCard from '@/MovieCard'
import { movieListOptions } from '@/movies/movie.quries'
import SearchBar from './SearchBar'
import { useCallback, useState } from 'react'
import type { MovieSort } from '@/movies/movie.types'
import { sortMovies } from '@/movies/movie.utils'

const MovieBoard = () => {
  const [searchTerm, setSearchTerm] = useState('t')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('t')
  const [sortBy, setSortBy] = useState<MovieSort>('original')

  const onChangeSearchTerm = useCallback((value: string) => {
    setTimeout(() => setDebouncedSearchTerm(value), 300)
    setSearchTerm(value)
  }, [])

  const { data: movies = [] } = useQuery(movieListOptions())

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  )
  const sortedMovies = sortMovies(filteredMovies, sortBy)

  return (
    <main className="min-h-screen bg-canvas text-white [color-scheme:dark]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-8 sm:pt-20">
        <Header />
        <SearchBar
          searchTerm={searchTerm}
          onChangeSearchTerm={onChangeSearchTerm}
        />
        <section aria-labelledby="movies-heading" className="mt-10">
          <h2 id="movies-heading" className="text-2xl font-bold sm:text-3xl">
            All Movies
          </h2>
          <label className="mt-4 flex items-center gap-3 text-sm text-muted">
            정렬
            <select
              value={sortBy}
              onChange={(event) => {
                const value = event.currentTarget.value
                if (
                  value === 'original' ||
                  value === 'title' ||
                  value === 'rating'
                ) {
                  setSortBy(value)
                }
              }}
              className="rounded-lg border border-white/10 bg-panel px-3 py-2 text-white"
            >
              <option value="original">기본순</option>
              <option value="title">제목순 (오름차순)</option>
              <option value="rating">평점순 (높은 순)</option>
            </select>
          </label>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {sortedMovies.map((movie) => (
              <li key={movie.id}>
                <MovieCard movie={movie} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

export default MovieBoard
