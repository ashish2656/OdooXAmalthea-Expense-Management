"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { fetcher } from "@/lib/fetcher"
import { useExchangeRates } from "@/hooks/use-exchange-rates"

const categories = ["Travel", "Meals", "Supplies", "Software", "Other"]
const paidByOptions = ["Employee", "Company Card"]

export default function EmployeePage() {
  const brandVars = { "--primary": "oklch(0.6 0.12 255)", "--primary-foreground": "oklch(0.98 0 0)" }

  const companyCurrency = typeof window !== "undefined" ? localStorage.getItem("companyCurrency") || "USD" : "USD"

  const [form, setForm] = useState({
    category: "",
    paidBy: "",
    amount: "",
    currency: companyCurrency,
    date: "",
    description: "",
    receiptUrl: "",
  })
  const [rows, setRows] = useState([
    { id: 1, owner: "You", category: "Travel", amount: 125, currency: companyCurrency, status: "Approved" },
    { id: 2, owner: "You", category: "Meals", amount: 35, currency: companyCurrency, status: "Pending" },
  ])

  const { data: countries } = useSWR("https://restcountries.com/v3.1/all?fields=name,currencies", fetcher)

  const currencyOptions = useMemo(() => {
    if (!countries) return [companyCurrency, "USD", "EUR", "GBP"]
    const set = new Set([companyCurrency])
    countries.forEach((c) => c.currencies && Object.keys(c.currencies).forEach((code) => set.add(code)))
    return Array.from(set).sort().slice(0, 200)
  }, [countries, companyCurrency])

  const { convert } = useExchangeRates(form.currency || companyCurrency)

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onReceiptUpload = (file) => {
    // Mock OCR: auto-fill from file name "travel_2024-01-01_123.45.png"
    const name = file?.name || ""
    const m = name.match(/([A-Za-z]+).*?(\d{4}-\d{2}-\d{2}).*?(\d+(\.\d+)?)/)
    const category = m?.[1] || "Travel"
    const date = m?.[2] || new Date().toISOString().slice(0, 10)
    const amount = m?.[3] || "42.00"
    setTimeout(() => {
      setForm((f) => ({
        ...f,
        category,
        date,
        amount,
        description: f.description || "Auto-filled via OCR mock",
        receiptUrl: URL.createObjectURL(file),
      }))
    }, 500)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const newRow = {
      id: rows.length + 1,
      owner: "You",
      category: form.category || "Other",
      amount: Number(form.amount) || 0,
      currency: form.currency || companyCurrency,
      status: "Pending",
    }
    setRows((r) => [newRow, ...r])
    setForm({
      category: "",
      paidBy: "",
      amount: "",
      currency: companyCurrency,
      date: "",
      description: "",
      receiptUrl: "",
    })
  }

  return (
    <main className="min-h-[100svh] bg-muted" style={brandVars}>
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-foreground">Submit Expense</h1>
          <p className="text-muted-foreground">Upload a receipt or enter details manually</p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-2xl border border-border shadow-md p-4"
        >
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Paid By</label>
              <select
                value={form.paidBy}
                onChange={(e) => onChange("paidBy", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select</option>
                {paidByOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => onChange("amount", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Company default: {companyCurrency}. Example: 100 {form.currency} ≈{" "}
                {convert(100, form.currency, companyCurrency)} {companyCurrency}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => onChange("date", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Receipt</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onReceiptUpload(e.target.files?.[0])}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
              {form.receiptUrl ? (
                <img
                  src={form.receiptUrl || "/placeholder.svg"}
                  alt="Receipt preview"
                  className="mt-3 h-40 w-auto rounded-lg border border-border object-cover"
                />
              ) : null}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90 transition"
              >
                Submit Expense
              </button>
            </div>
          </form>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-2xl border border-border shadow-md p-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">Past Expenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2">Category</th>
                  <th className="text-left px-3 py-2">Amount</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className={i % 2 === 0 ? "bg-background" : "bg-muted"}
                  >
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2">
                      {r.amount} {r.currency}
                    </td>
                    <td className="px-3 py-2">{r.status}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
