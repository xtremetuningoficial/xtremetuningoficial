import { SearchIcon } from '../icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">Buscar producto</span>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-900/40">
        <SearchIcon className="h-4 w-4" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nombre..."
        className="w-full rounded-full border border-ink-900/15 bg-white py-2 pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-900/40 focus:border-electric-500"
      />
    </label>
  )
}
