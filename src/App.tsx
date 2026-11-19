import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MovieBoard from './MovieBoard'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MovieBoard />
      </QueryClientProvider>
    </>
  )
}

export default App
