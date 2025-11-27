import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { Employee, Role, useStore } from '../state/store'
import { AlertCircle, CheckCircle2, Filter, Plus, Shield } from 'lucide-react'

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployeeRole, removeEmployee, employeeHasValidDocs } = useStore()
  const nav = useNavigate()

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDept, setNewDept] = useState('')
  const [newRole, setNewRole] = useState<Role>('COORDINATOR')

  // Фильтры
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL')
  const [deptFilter, setDeptFilter] = useState<'ALL' | string>('ALL')

  const departmentOptions = useMemo(() => {
    const set = new Set<string>()
    employees.forEach(e => {
      if (e.department) set.add(e.department)
    })
    return Array.from(set).sort()
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const text = (e.name + ' ' + e.email).toLowerCase()
      if (search.trim() && !text.includes(search.trim().toLowerCase())) {
        return false
      }
      if (roleFilter !== 'ALL' && e.role !== roleFilter) {
        return false
      }
      if (deptFilter !== 'ALL' && e.department !== deptFilter) {
        return false
      }
      return true
    })
  }, [employees, search, roleFilter, deptFilter])

  const handleAddEmployee = () => {
    if (!newName.trim() || !newEmail.trim()) {
      alert('Name and email are required')
      return
    }
    addEmployee({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept.trim() || undefined,
      // @ts-ignore
      documents: [],
    })
    setNewName('')
    setNewEmail('')
    setNewDept('')
    setNewRole('COORDINATOR')
    setShowAdd(false)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Employees"
        subtitle="Manage employees, their roles and travel documents. Admin configures, coordinators book."
      />

      {/* Верхний блок: CTA + краткое описание */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-slate-600 flex items-start gap-2">
          <Shield size={14} className="mt-[2px] text-slate-500" />
          <span>
            Employees are used as travelers in bookings. Admin manages roles and documents, coordinator works with
            day-to-day trips and tickets.
          </span>
        </div>
        <button
          className="btn-primary flex items-center gap-2 text-xs self-start md:self-auto"
          onClick={() => setShowAdd(prev => !prev)}
        >
          <Plus size={14} />
          Add employee
        </button>
      </div>

      {/* Форма добавления сотрудника */}
      {showAdd && (
        <div className="card p-4 space-y-3">
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <Field label="Full name" value={newName} onChange={setNewName} />
            <Field label="Email" value={newEmail} onChange={setNewEmail} />
            <Field label="Department (optional)" value={newDept} onChange={setNewDept} />
            <div>
              <label className="text-xs text-slate-500">Role</label>
              <select className="select mt-1" value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
                <option value="ADMIN">Admin</option>
                <option value="COORDINATOR">Coordinator</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end text-xs">
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddEmployee}>
              Save employee
            </button>
          </div>
        </div>
      )}

      {/* Фильтры списка сотрудников */}
      <div className="card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Filter size={14} />
          <span>Filter employees</span>
        </div>
        <div className="grid gap-2 md:grid-cols-3 w-full md:w-auto">
          <div>
            <label className="text-[11px] text-slate-500">Search (name or email)</label>
            <input
              className="input mt-1 h-8 text-xs"
              placeholder="Type to search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Role</label>
            <select
              className="select mt-1 h-8 text-xs"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as 'ALL' | Role)}
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Department</label>
            <select
              className="select mt-1 h-8 text-xs"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as 'ALL' | string)}
            >
              <option value="ALL">All departments</option>
              {departmentOptions.map(dep => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Таблица сотрудников */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Documents</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(e => {
              const docInfo = getDocumentsStatus(e)
              const canTravel = employeeHasValidDocs(e.id)
              return (
                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-xs text-slate-500">{e.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {e.department || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <select
                      className="select h-7 text-xs"
                      value={e.role}
                      onChange={ev => updateEmployeeRole(e.id, ev.target.value as Role)}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="COORDINATOR">Coordinator</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1">
                        {docInfo.icon}
                        <span className={docInfo.className}>{docInfo.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {canTravel ? 'OK for booking' : 'Cannot book flights (no valid ID/passport)'}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-ghost" onClick={() => nav(`/employees/${e.id}`)}>
                        View
                      </button>
                      <button
                        className="btn-ghost text-red-600"
                        onClick={() => {
                          if (window.confirm('Remove this employee from company?')) {
                            removeEmployee(e.id)
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="p-4 text-xs text-slate-500 text-center">No employees match current filters.</div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input className="input mt-1" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function getDocumentsStatus(e: Employee) {
  if (!e.documents || e.documents.length === 0) {
    return {
      label: 'No documents',
      className: 'text-slate-500',
      icon: <AlertCircle size={12} className="text-slate-400" />,
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const soonThreshold = new Date()
  soonThreshold.setDate(soonThreshold.getDate() + 60)
  const soonStr = soonThreshold.toISOString().slice(0, 10)

  const hasExpired = e.documents.some(d => d.expirationDate < todayStr)
  const hasSoon = e.documents.some(d => d.expirationDate >= todayStr && d.expirationDate <= soonStr)

  if (hasExpired) {
    return {
      label: 'Some documents expired',
      className: 'text-red-600',
      icon: <AlertCircle size={12} className="text-red-500" />,
    }
  }
  if (hasSoon) {
    return {
      label: 'Expiring soon',
      className: 'text-amber-600',
      icon: <AlertCircle size={12} className="text-amber-500" />,
    }
  }
  return {
    label: 'All documents valid',
    className: 'text-emerald-600',
    icon: <CheckCircle2 size={12} className="text-emerald-500" />,
  }
}
