import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"

// Simple conversion with public API (mock)
export function useExchangeRates(base = "USD") {
  const { data } = useSWR(base ? `https://api.exchangerate-api.com/v4/latest/${base}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  const convert = (amount, from, to) => {
    if (!data || !data.rates) return amount
    if (from === to) return amount
    // Convert from -> base -> to
    const toBase = from === data.base ? amount : amount / (data.rates[from] || 1)
    const out = toBase * (data.rates[to] || 1)
    return Number(out.toFixed(2))
  }

  return { rates: data?.rates || {}, base: data?.base || base, convert }
}
