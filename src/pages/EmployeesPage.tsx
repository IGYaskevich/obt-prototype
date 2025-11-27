import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import {useStore, Employee, Role} from '../state/store'
import { Shield, Plus, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react'

export default function EmployeesPage() {
    const { employees, addEmployee, updateEmployeeRole, removeEmployee, employeeHasValidDocs } = useStore()
    const nav = useNavigate()

    const [showAdd, setShowAdd] = useState(false)
    const [newName, setNewName] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [newDept, setNewDept] = useState('')
    const [newRole, setNewRole] = useState<'ADMIN' | 'COORDINATOR'>('ADMIN')

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
        })
        setNewName('')
        setNewEmail('')
        setNewDept('')
        setNewRole('ADMIN')
        setShowAdd(false)
    }

    return (
        <div className="space-y-5">
            <SectionHeader
                title="Employees"
                subtitle="Manage employees, their roles, travel documents and corporate cards"
            />

            <div className="card p-4 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                    Employees have roles (Admin / Booker / Viewer), documents with expiration dates, and optional corporate cards
                    used for business travel.
                </div>
                <button
                    className="btn-primary flex items-center gap-2 text-xs"
                    onClick={() => setShowAdd(prev => !prev)}
                >
                    <Plus size={14} />
                    Add employee
                </button>
            </div>

            {showAdd && (
                <div className="card p-4 space-y-3">
                    <div className="grid md:grid-cols-4 gap-3 text-sm">
                        <Field label="Full name" value={newName} onChange={setNewName} />
                        <Field label="Email" value={newEmail} onChange={setNewEmail} />
                        <Field label="Department (optional)" value={newDept} onChange={setNewDept} />
                        <div>
                            <label className="text-xs text-slate-500">Role</label>
                            <select
                                className="select mt-1"
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as any)}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="BOOKER">Booker</option>
                                <option value="VIEWER">Viewer</option>
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

            <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th className="px-3 py-2 text-left">Employee</th>
                        <th className="px-3 py-2 text-left">Department</th>
                        <th className="px-3 py-2 text-left">Role</th>
                        <th className="px-3 py-2 text-left">Documents</th>
                        <th className="px-3 py-2 text-left">Cards</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map(e => {
                        const docInfo = getDocumentsStatus(e)
                        const cardsCount = e.cards?.length ?? 0
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
                                <td className="px-3 py-2 text-xs">
                                    <div className="inline-flex items-center gap-1">
                                        <CreditCard size={12} className="text-slate-500" />
                                        {cardsCount > 0 ? (
                                            <span>{cardsCount} card{cardsCount > 1 ? 's' : ''}</span>
                                        ) : (
                                            <span className="text-slate-400">No cards</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-xs text-right">
                                    <div className="inline-flex gap-2">
                                        <button
                                            className="btn-ghost"
                                            onClick={() => nav(`/employees/${e.id}`)}
                                        >
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

                {employees.length === 0 && (
                    <div className="p-4 text-xs text-slate-500 text-center">
                        No employees yet. Use “Add employee” to create the first one.
                    </div>
                )}
            </div>
        </div>
    )
}

function Field({
                   label,
                   value,
                   onChange,
               }: {
    label: string
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div>
            <label className="text-xs text-slate-500">{label}</label>
            <input
                className="input mt-1"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
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