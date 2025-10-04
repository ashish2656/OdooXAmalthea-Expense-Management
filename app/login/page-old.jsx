/* eslint-disable react/no-unescaped-entities */
"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // brand color override primary
  const brandVars = { "--primary": "oklch(0.6 0.12 255)", "--primary-foreground": "oklch(0.98 0 0)" }

  const onSubmit = (e) => {
    e.preventDefault()
    console.log("[v0] Login submitted:", { email })
    // simulate route after login
    window.location.href = "/employee"
  }

  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-background" style={brandVars}>
      <motion.div
        initial={{ opacity, y }}
        animate={{ opacity, y }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-card shadow-lg rounded-2xl border border-border p-6"
      >
        <h1 className="text-2xl font-semibold text-foreground text-balance">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Sign in to manage your expenses</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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

          <div className="flex items-center justify-between text-sm">
            <Link href="#" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90 transition"
          >
            Sign in
          </button>

          <p className="text-sm text-muted-foreground text-center">
            {"Don’t have an account? "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </main>
  )
}


