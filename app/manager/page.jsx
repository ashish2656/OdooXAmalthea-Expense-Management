"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const initial = [
  {
    id: 101,
    owner: "Alice Johnson",
    category: "Travel",
    amount: 220,
    currency: "USD",
    status: "Pending",
    description: "Flight to NYC",
    receiptUrl: "",
  },
  {
    id: 102,
    owner: "Bob Smith",
    category: "Meals",
    amount: 45,
    currency: "USD",
    status: "Pending",
    description: "Client lunch",
    receiptUrl: "",
  },
]

export default function ManagerPage() {
  const [rows, setRows] = useState(initial)
  const [active, setActive] = useState(null)
  const brandVars = { "--primary": "oklch(0.6 0.12 255)", "--primary-foreground": "oklch(0.98 0 0)" }

  const setStatus = (id, status, comment) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status, managerComment: comment } : x)))
    setActive(null)
  }

  return (
    <main className="min-h-[100svh] bg-muted" style={brandVars}>
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-foreground">Approvals to Review</h1>
          <p className="text-muted-foreground">Review, approve, or reject expense submissions</p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card rounded-2xl border border-border shadow-md p-4"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-2">Request Owner</th>
                  <th className="text-left px-3 py-2">Category</th>
                  <th className="text-left px-3 py-2">Amount</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Actions</th>
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
                    <td className="px-3 py-2">{r.owner}</td>
                    <td className="px-3 py-2">{r.category}</td>
                    <td className="px-3 py-2">
                      {r.amount} {r.currency}
                    </td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg bg-secondary text-secondary-foreground px-3 py-1"
                          onClick={() => setActive(r)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[oklch(0_0_0/0.5)] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="bg-card rounded-2xl border border-border shadow-lg max-w-lg w-full p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Expense Details</h2>
                    <p className="text-sm text-muted-foreground">Owner: {active.owner}</p>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground" onClick={() => setActive(null)}>
                    Close
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Category:</span> {active.category}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> {active.amount} {active.currency}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span> {active.description}
                  </p>
                  {active.receiptUrl ? (
                    <img
                      src={active.receiptUrl || "/placeholder.svg"}
                      alt="Receipt"
                      className="mt-2 rounded-lg border border-border"
                    />
                  ) : (
                    <div className="mt-2 rounded-lg border border-border p-3 text-muted-foreground">
                      No receipt preview
                    </div>
                  )}
                </div>

                <ApprovalActions row={active} onAction={setStatus} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function ApprovalActions({ row, onAction }) {
  const [comment, setComment] = useState("")
  return (
    <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <input
        type="text"
        placeholder="Add comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1 rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2 justify-end">
        <button
          className="rounded-xl bg-secondary text-secondary-foreground px-4 py-2"
          onClick={() => onAction(row.id, "Rejected", comment)}
        >
          Reject
        </button>
        <button
          className="rounded-xl bg-primary text-primary-foreground px-4 py-2"
          onClick={() => onAction(row.id, "Approved", comment)}
        >
          Approve
        </button>
      </div>
    </div>
  )
}
