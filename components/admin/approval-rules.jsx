"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const ruleTypes = [
  { value: "percentage", label: "Percentage rule" },
  { value: "specific", label: "Specific approver" },
  { value: "hybrid", label: "Hybrid" },
]

export function ApprovalRules() {
  const [rules, setRules] = useState([])
  const [form, setForm] = useState({
    kind: "percentage",
    sequence: 1,
    thresholdPct: 10,
    approver: "",
    note: "",
  })

  const addRule = () => {
    setRules((r) => [{ id: Date.now(), ...form }, ...r])
    setForm({ kind: "percentage", sequence: 1, thresholdPct: 10, approver: "", note: "" })
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-foreground">Approval Rules Configurator</h2>
        <p className="text-sm text-muted-foreground">Sequence-based or conditional rules</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Rule Type</label>
          <select
            value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          >
            {ruleTypes.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Sequence</label>
          <input
            type="number"
            value={form.sequence}
            onChange={(e) => setForm((f) => ({ ...f, sequence: Number(e.target.value) }))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Threshold %</label>
          <input
            type="number"
            value={form.thresholdPct}
            onChange={(e) => setForm((f) => ({ ...f, thresholdPct: Number(e.target.value) }))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Specific Approver</label>
          <input
            placeholder="email or name"
            value={form.approver}
            onChange={(e) => setForm((f) => ({ ...f, approver: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Note</label>
          <input
            placeholder="Optional"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={addRule} className="rounded-xl bg-primary text-primary-foreground px-4 py-2">
          Add Rule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">Sequence</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Threshold %</th>
              <th className="text-left px-3 py-2">Approver</th>
              <th className="text-left px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={i % 2 === 0 ? "bg-background" : "bg-muted"}
              >
                <td className="px-3 py-2">{r.sequence}</td>
                <td className="px-3 py-2 capitalize">{r.kind}</td>
                <td className="px-3 py-2">{r.thresholdPct}%</td>
                <td className="px-3 py-2">{r.approver || "-"}</td>
                <td className="px-3 py-2">{r.note || "-"}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
