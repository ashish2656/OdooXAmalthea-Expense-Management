"use client"
import { motion } from "framer-motion"
import { UserManagement } from "@/components/admin/user-management"
import { ApprovalRules } from "@/components/admin/approval-rules"

export default function AdminPage() {
  const brandVars = { "--primary": "oklch(0.6 0.12 255)", "--primary-foreground": "oklch(0.98 0 0)" }

  return (
    <main className="min-h-[100svh] bg-muted" style={brandVars}>
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and approval rules</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-card rounded-2xl border border-border shadow-md p-4"
          >
            <UserManagement />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="bg-card rounded-2xl border border-border shadow-md p-4"
          >
            <ApprovalRules />
          </motion.section>
        </div>
      </div>
    </main>
  )
}
