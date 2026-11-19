import { env } from '@/config/env'

const tmdbApiKey = env.tmdbApiKey
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/'

const setSearchParams = (url: URL, params: Record<string, string>): URL => {
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value)
  }
  return url
}

const tmdbGet = async <T>(
  path: string,
  params: Record<string, string>,
): Promise<T> => {
  const url = new URL(path, TMDB_API_BASE_URL)
  setSearchParams(url, params)
  setSearchParams(url, { api_key: tmdbApiKey ?? '' })
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`TMDB 요청 실패: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export default tmdbGet
