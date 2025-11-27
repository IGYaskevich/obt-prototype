import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { Trip, useStore } from '../state/store'
import { AlertTriangle, Check, X, ShieldCheck, Filter } from 'lucide-react'

type LocalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export default function ApprovalsPage() {
    const nav = useNavigate()
    const { company, trips, employees } = useStore()

    // Моки, если в сторе нет данных
    const [demoTrips] = useState<Trip[]>([
        {
            id: 'T3',
            title: 'Almaty → Shymkent',
            total: 95000,
            type: 'single',
            status: 'NEEDS_APPROVAL',
            createdAt: '2025-11-15T13:30:00.000Z',
            employeeId: 'E3',
        },
        {
            id: 'T6',
            title: 'Almaty → Astana (late booking)',
            total: 145000,
            type: 'single',
            status: 'NEEDS_APPROVAL',
            createdAt: '2025-11-19T09:10:00.000Z',
            employeeId: 'E2',
        },
    ])

    const sourceTrips = trips.length > 0 ? trips : demoTrips

    const approvals = useMemo(() => {
        return sourceTrips
            .filter(t => t.status === 'NEEDS_APPROVAL')
            .map(t => {
                const emp = employees.find(e => e.id === t.employeeId)
                const reason =
                    t.total > 150000
                        ? 'Over budget'
                        : t.type === 'basket'
                            ? 'Complex trip / basket'
                            : 'Out of policy or manual check'
                return {
                    ...t,
                    employee: emp,
                    reason,
                }
            })
    }, [sourceTrips, employees])

    const [localStatuses, setLocalStatuses] = useState<Record<string, LocalStatus>>(() => {
        const initial: Record<string, LocalStatus> = {}
        approvals.forEach(a => {
            initial[a.id] = 'PENDING'
        })
        return initial
    })

    const summary = useMemo(() => {
        let pending = 0
        let approved = 0
        let rejected = 0
        approvals.forEach(a => {
            const st = localStatuses[a.id] || 'PENDING'
            if (st === 'PENDING') pending++
            if (st === 'APPROVED') approved++
            if (st === 'REJECTED') rejected++
        })
        return { pending, approved, rejected }
    }, [approvals, localStatuses])

    const handleDecision = (id: string, status: LocalStatus) => {
        setLocalStatuses(prev => ({
            ...prev,
            [id]: status,
        }))
    }

    if (!company) return null

    return (
        <div className="space-y-5">
            <SectionHeader
                title="Approvals & policy checks"
                subtitle="Trips that require manual approval or are out of policy"
                right={
                    <button className="btn-ghost text-sm" onClick={() => nav('/')}>
                        Back to dashboard
                    </button>
                }
            />

            {/* Summary */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="text-xs text-slate-500">Pending</div>
                    <div className="text-2xl font-semibold text-amber-700 mt-1">
                        {summary.pending}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Need your decision
                    </div>
                </div>
                <div className="card p-4">
                    <div className="text-xs text-slate-500">Approved (demo)</div>
                    <div className="text-2xl font-semibold text-emerald-700 mt-1">
                        {summary.approved}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Will continue to ticketing
                    </div>
                </div>
                <div className="card p-4">
                    <div className="text-xs text-slate-500">Rejected (demo)</div>
                    <div className="text-2xl font-semibold text-rose-700 mt-1">
                        {summary.rejected}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Employee will need to rebook
                    </div>
                </div>
                <div className="card p-4 bg-slate-50/60">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck size={14} /> Policy hint
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                        In the real product, approval rules are configured in travel policies:
                        limits per route, class, project and role.
                    </div>
                </div>
            </div>

            {/* Filters (mock) */}
            <div className="card p-3 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter size={14} /> Filters (demo)
                </div>
                <select className="select text-xs max-w-[160px]">
                    <option>All departments</option>
                    <option>Finance</option>
                    <option>Sales</option>
                    <option>Operations</option>
                </select>
                <select className="select text-xs max-w-[160px]">
                    <option>Any reason</option>
                    <option>Over budget</option>
                    <option>Out of policy</option>
                    <option>Complex trip</option>
                </select>
            </div>

            {/* Approvals table */}
            {approvals.length === 0 && (
                <div className="card p-4 flex items-center gap-2 text-sm text-slate-600">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    No trips require approval now (demo).
                </div>
            )}

            {approvals.length > 0 && (
                <div className="card p-0 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th className="px-4 py-2 text-left">Trip</th>
                            <th className="px-4 py-2 text-left">Employee</th>
                            <th className="px-4 py-2 text-left">Reason</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {approvals.map(a => {
                            const local = localStatuses[a.id] || 'PENDING'
                            const highlightClass =
                                local === 'APPROVED'
                                    ? 'bg-emerald-50/40'
                                    : local === 'REJECTED'
                                        ? 'bg-rose-50/40'
                                        : ''

                            return (
                                <tr key={a.id} className={`border-t border-slate-100 ${highlightClass}`}>
                                    <td className="px-4 py-3 align-top">
                                        <div className="font-medium">{a.title}</div>
                                        <div className="text-xs text-slate-500">
                                            {a.type === 'single' ? 'Single ticket' : 'Trip basket'} ·{' '}
                                            {new Date(a.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        {a.employee ? (
                                            <>
                                                <div>{a.employee.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {a.employee.department || '—'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-slate-500">Unknown</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="flex items-center gap-1 text-xs">
                                            <AlertTriangle size={14} className="text-amber-600" />
                                            <span>{a.reason}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                                        {a.total.toLocaleString()} ₸
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <StatusPill status={local} />
                                    </td>
                                    <td className="px-4 py-3 align-top text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="btn-ghost text-xs flex items-center gap-1"
                                                disabled={local === 'APPROVED'}
                                                onClick={() => handleDecision(a.id, 'APPROVED')}
                                            >
                                                <Check size={14} />
                                                Approve
                                            </button>
                                            <button
                                                className="btn-ghost text-xs flex items-center gap-1"
                                                disabled={local === 'REJECTED'}
                                                onClick={() => handleDecision(a.id, 'REJECTED')}
                                            >
                                                <X size={14} />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                        In this prototype, approval actions are stored locally in the UI and do not update
                        global trip status. In a real system they would trigger ticketing or cancellation.
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusPill({ status }: { status: LocalStatus }) {
    let text = ''
    let cls = ''

    if (status === 'PENDING') {
        text = 'Pending'
        cls = 'bg-amber-50 text-amber-700 border-amber-200'
    } else if (status === 'APPROVED') {
        text = 'Approved'
        cls = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    } else {
        text = 'Rejected'
        cls = 'bg-rose-50 text-rose-700 border-rose-200'
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>
      {text}
    </span>
    )
}