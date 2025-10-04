"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"

export function CountriesSelect({ value, onChange }) {
  const { data, error, isLoading } = useSWR("https://restcountries.com/v3.1/all?fields=name,currencies", fetcher)

  const countries = (data || [])
    .map((c) => c?.name?.common)
    .filter(Boolean)
    .sort()

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Country</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{isLoading ? "Loading..." : "Select country"}</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}



