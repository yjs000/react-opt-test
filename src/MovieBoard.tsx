import { Header } from '@/Header'
import { useQuery } from '@tanstack/react-query'
import MovieCard from '@/MovieCard'
import { movieSearchOptions } from '@/movies/movie.quries'
import SearchBar from './SearchBar'

const MovieBoard = () => {
  const { data: movies = [] } = useQuery(
    movieSearchOptions({ searchTerm: 't' }),
  )

  return (
    <main className="min-h-screen bg-canvas text-white [color-scheme:dark]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-8 sm:pt-20">
        <Header />
        <SearchBar />
        <section aria-labelledby="movies-heading" className="mt-10">
          <h2 id="movies-heading" className="text-2xl font-bold sm:text-3xl">
            All Movies
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {movies.map((movie) => (
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
