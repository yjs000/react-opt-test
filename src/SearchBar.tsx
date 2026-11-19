const SearchBar = () => {
  return (
    <label className="mx-auto mt-8 flex max-w-3xl items-center gap-3 rounded-xl bg-panel px-4 focus-within:ring-2 focus-within:ring-accent sm:mt-10">
      <svg
        aria-hidden="true"
        className="size-5 shrink-0 text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <span className="sr-only">Search movies</span>
      <input
        type="search"
        placeholder="Search through thousands of movies"
        className="min-w-0 flex-1 py-4 text-sm outline-none placeholder:text-muted sm:text-base"
      />
    </label>
  )
}

export default SearchBar
