import { memo } from 'react'
import MovieCard from './MovieCard'
import type { Movie } from './movies/movie.types'

const MovieList = memo(({ movies }: { movies: Movie[] }) => {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {movies.map((movie: Movie) => (
          <li key={movie.id} className="movie-list-item">
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  )
})

export default MovieList
