import { Header } from './Header'
import { useQuery } from '@tanstack/react-query'
import MovieCard from './MovieCard'
import type { TmdbSearchResponse } from './movies/tmdb.types'

const MovieBoard = () => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  const { data } = useQuery<TmdbSearchResponse>({
    queryKey: ['repoData'],
    enabled: Boolean(apiKey),
    queryFn: async () => {
      const url = new URL('https://api.themoviedb.org/3/search/movie')
      url.searchParams.set('api_key', apiKey)
      url.searchParams.set('query', 't')

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch repo data')
      return response.json()
    },
  })

  const movies = data?.results ?? []

  return (
    <main className="min-h-screen bg-canvas text-white [color-scheme:dark]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-8 sm:pt-20">
        <Header />
        <section aria-labelledby="movies-heading" className="mt-10">
          <h2 id="movies-heading" className="text-2xl font-bold sm:text-3xl">
            All Movies
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {movies.map((movie) => (
              <li key={movie.id}>
                <MovieCard {...movie} title={movie.title} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

export default MovieBoard
