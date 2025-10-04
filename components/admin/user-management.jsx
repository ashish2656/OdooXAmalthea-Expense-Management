"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const initialUsers = [
  { id: 1, name: "Alice Johnson", role: "Employee", email: "alice@example.com", password: "••••••••" },
  { id: 2, name: "Bob Smith", role: "Manager", email: "bob@example.com", password: "••••••••" },
]

export function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [newUser, setNewUser] = useState({ name: "", role: "Employee", email: "", password: "" })

  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    setUsers((u) => [{ id: Date.now(), ...newUser }, ...u])
    setNewUser({ name: "", role: "Employee", email: "", password: "" })
  }

  const assignRole = (id, role) => setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } )))
  const defineManager = (id) => alert(`Define manager for user #${id} (mock)`)

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground">Add employees, assign roles, define managers</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser((n) => ({ ...n, name: e.target.value }))}
          className="rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser((n) => ({ ...n, role: e.target.value }))}
          className="rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        >
          <option>Employee</option>
          <option>Manager</option>
          <option>Admin</option>
        </select>
        <input
          placeholder="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser((n) => ({ ...n, email: e.target.value }))}
          className="rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          placeholder="Password"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser((n) => ({ ...n, password: e.target.value }))}
          className="rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={addUser} className="rounded-xl bg-primary text-primary-foreground px-4 py-2">
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Password</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={i % 2 === 0 ? "bg-background" : "bg-muted"}
              >
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.password}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <select
                      value={u.role}
                      onChange={(e) => assignRole(u.id, e.target.value)}
                      className="rounded-lg border border-input bg-background px-2 py-1"
                    >
                      <option>Employee</option>
                      <option>Manager</option>
                      <option>Admin</option>
                    </select>
                    <button
                      className="rounded-lg bg-secondary text-secondary-foreground px-3 py-1"
                      onClick={() => defineManager(u.id)}
                    >
                      Define Manager
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



