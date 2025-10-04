"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { fetcher } from "@/lib/fetcher"
import { CountriesSelect } from "@/components/shared/countries-select"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [showCompanySetup, setShowCompanySetup] = useState(false)
  const [country, setCountry] = useState("")
  const [currency, setCurrency] = useState("")

  const brandVars = { "--primary": "oklch(0.6 0.12 255)", "--primary-foreground": "oklch(0.98 0 0)" }

  // mock "first signup"
  useEffect(() => {
    const first = localStorage.getItem("companyCreated") !== "true"
    setShowCompanySetup(first)
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (showCompanySetup && (!country || !currency)) {
      setError("Please select country and currency.")
      return
    }
    if (showCompanySetup) {
      localStorage.setItem("companyCountry", country)
      localStorage.setItem("companyCurrency", currency)
      localStorage.setItem("companyCreated", "true")
    }
    console.log("[v0] Signup:", { email, country, currency })
    window.location.href = "/admin"
  }

  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-background" style={brandVars}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-xl bg-card shadow-lg rounded-2xl border border-border p-6"
      >
        <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="text-muted-foreground mt-1">Sign up to get started</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? <p className="text-sm text-[oklch(0.6_0.2_25)]">{error}</p> : null}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <AnimatePresence>
            {showCompanySetup && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <h2 className="text-sm font-semibold text-foreground mb-3">Company setup (first signup)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CountriesSelect value={country} onChange={setCountry} />
                  <CurrencySelect selected={currency} setSelected={setCurrency} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90 transition"
          >
            Create account
          </button>

          <p className="text-sm text-muted-foreground text-center">
            {"Already have an account? "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  )
}

function CurrencySelect({ selected, setSelected }) {
  // derive options from restcountries if available, else fall back
  const { data: countries } = useSWR("https://restcountries.com/v3.1/all?fields=name,currencies", fetcher)

  const currencyOptions = useMemo(() => {
    if (!countries) return ["USD", "EUR", "GBP"]
    const set = new Set()
    countries.forEach((c) => {
      if (c.currencies) {
        Object.keys(c.currencies).forEach((code) => set.add(code))
      }
    })
    return Array.from(set).sort().slice(0, 200)
  }, [countries])

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Select currency</option>
        {currencyOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}
