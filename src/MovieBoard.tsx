import { Header } from '@/Header'
import { useQuery } from '@tanstack/react-query'
import MovieCard from '@/MovieCard'
import { movieListOptions } from '@/movies/movie.quries'
import SearchBar from './SearchBar'
import { useState } from 'react'

const MovieBoard = () => {
  const [searchTerm, setSearchTerm] = useState('t')
  const { data: movies = [] } = useQuery(movieListOptions())
  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const onChangeSearchTerm = (value: string) => {
    setSearchTerm(value)
  }
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
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {filteredMovies.map((movie) => (
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
