import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import {
    useStore,
    EmployeeDocumentType,
} from '../state/store'
import {
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Plus,
    Trash2,
    CreditCard,
} from 'lucide-react'

export default function EmployeeProfilePage() {
    const { id } = useParams<{ id: string }>()
    const nav = useNavigate()
    const {
        getEmployeeById,
        updateEmployeeRole,
        addEmployeeDocument,
        removeEmployeeDocument,
        addEmployeeCard,
        removeEmployeeCard,
        employeeHasValidDocs,
    } = useStore()

    const employee = getEmployeeById(id || '')

    const [docType, setDocType] = useState<EmployeeDocumentType>('PASSPORT')
    const [docNumber, setDocNumber] = useState('')
    const [docExp, setDocExp] = useState('')
    const [docCountry, setDocCountry] = useState('')

    const [cardProvider, setCardProvider] = useState('Kaspi')
    const [cardLabel, setCardLabel] = useState('Corporate travel card')
    const [cardLast4, setCardLast4] = useState('')
    const [cardExp, setCardExp] = useState('2027-08')

    const canTravel = employee && employeeHasValidDocs(employee.id)

    const docStatusSummary = useMemo(
        () => (employee ? calcDocsSummary(employee.documents) : null),
        [employee]
    )

    if (!employee) {
        return (
            <div className="space-y-4">
                <button className="btn-ghost text-xs" onClick={() => nav('/employees')}>
                    <ArrowLeft size={14} /> Back to employees
                </button>
                <div className="card p-4 text-sm text-red-600">
                    Employee not found
                </div>
            </div>
        )
    }

    const handleAddDoc = () => {
        if (!docNumber.trim() || !docExp) {
            alert('Document number and expiration date are required')
            return
        }
        addEmployeeDocument(employee.id, {
            type: docType,
            number: docNumber.trim(),
            expirationDate: docExp,
        })
        setDocNumber('')
        setDocExp('')
        setDocCountry('')
    }

    const handleAddCard = () => {
        if (!cardLast4.trim() || cardLast4.trim().length !== 4) {
            alert('Enter last 4 digits of card')
            return
        }
        addEmployeeCard(employee.id, {
            provider: cardProvider,
            label: cardLabel.trim() || 'Corporate card',
            last4: cardLast4.trim(),
            expiration: cardExp,
        })
        setCardLast4('')
    }

    return (
        <div className="space-y-6">
            <button className="btn-ghost text-xs flex items-center gap-1" onClick={() => nav('/employees')}>
                <ArrowLeft size={14} />
                Back to employees
            </button>

            <SectionHeader
                title={employee.name}
                subtitle={`Profile, documents and cards for business travel`}
            />

            {/* Summary card */}
            <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
                <div>
                    <div className="font-semibold">{employee.name}</div>
                    <div className="text-xs text-slate-500">{employee.email}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        Department: {employee.department || '—'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Role:{' '}
                        <select
                            className="select h-7 text-xs"
                            value={employee.role}
                            onChange={e => updateEmployeeRole(employee.id, e.target.value as any)}
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="BOOKER">Booker</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs flex flex-col gap-2 md:items-end">
                    {docStatusSummary && (
                        <div className="inline-flex items-center gap-2">
                            {docStatusSummary.icon}
                            <span className={docStatusSummary.className}>{docStatusSummary.label}</span>
                        </div>
                    )}
                    <div className="text-[11px] text-slate-500">
                        {canTravel
                            ? 'Employee can be used as traveler in bookings.'
                            : 'Employee cannot be used for booking until a valid passport or ID is added.'}
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <AlertCircle size={14} className="text-slate-500" />
                        Documents
                    </h2>
                    <div className="text-[11px] text-slate-500">
                        Add at least one valid passport or ID card to allow flight bookings.
                    </div>
                </div>

                {employee.documents.length === 0 ? (
                    <div className="text-xs text-slate-500">
                        No documents yet. Add the first document using the form below.
                    </div>
                ) : (
                    <table className="w-full text-xs border-collapse">
                        <thead className="bg-slate-50 text-[11px] text-slate-500">
                        <tr>
                            <th className="px-2 py-1 text-left">Type</th>
                            <th className="px-2 py-1 text-left">Number</th>
                            <th className="px-2 py-1 text-left">Expiration date</th>
                            <th className="px-2 py-1 text-left">Status</th>
                            <th className="px-2 py-1 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employee.documents.map(d => {
                            const statusColor =
                                d.status === 'VALID'
                                    ? 'text-emerald-600'
                                    : d.status === 'EXPIRED'
                                        ? 'text-red-600'
                                        : 'text-slate-500'
                            return (
                                <tr key={d.type + d.number} className="border-t border-slate-100">
                                    <td className="px-2 py-1">{prettyDocType(d.type)}</td>
                                    <td className="px-2 py-1 font-mono text-[11px]">{d.number}</td>
                                    <td className="px-2 py-1">{d.expirationDate}</td>
                                    <td className="px-2 py-1">
                                        <span className={statusColor}>{d.status}</span>
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <button
                                            className="btn-ghost text-xs text-red-600"
                                            onClick={() => removeEmployeeDocument(employee.id, d.number)}
                                        >
                                            <Trash2 size={12} />
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                )}

                {/* Add document form */}
                <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Plus size={12} /> Add document
                    </div>
                    <div className="grid md:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label className="text-[11px] text-slate-500">Type</label>
                            <select
                                className="select mt-1 h-8 text-xs"
                                value={docType}
                                onChange={e => setDocType(e.target.value as EmployeeDocumentType)}
                            >
                                <option value="PASSPORT">Passport</option>
                                <option value="ID_CARD">ID card</option>
                                <option value="VISA">Visa</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Number</label>
                            <input
                                className="input mt-1 h-8"
                                value={docNumber}
                                onChange={e => setDocNumber(e.target.value)}
                                placeholder="Document number"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Expiration date</label>
                            <input
                                type="date"
                                className="input mt-1 h-8"
                                value={docExp}
                                onChange={e => setDocExp(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Country (optional)</label>
                            <input
                                className="input mt-1 h-8"
                                value={docCountry}
                                onChange={e => setDocCountry(e.target.value)}
                                placeholder="KZ, TR, EU..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button className="btn-primary text-xs" onClick={handleAddDoc}>
                            Save document
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <CreditCard size={14} className="text-slate-500" />
                        Corporate cards
                    </h2>
                    <div className="text-[11px] text-slate-500">
                        Corporate cards can be used for company-paid tickets or hotel bookings.
                    </div>
                </div>

                {employee.cards && employee.cards.length > 0 ? (
                    <div className="space-y-2 text-xs">
                        {employee.cards.map(c => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between border border-slate-100 rounded-md px-3 py-2"
                            >
                                <div className="flex flex-col">
                  <span className="font-medium">
                    {c.label} · {c.provider}
                  </span>
                                    <span className="text-[11px] text-slate-500">
                    **** **** **** {c.last4} · exp {c.expiration}
                  </span>
                                </div>
                                <button
                                    className="btn-ghost text-xs text-red-600"
                                    onClick={() => removeEmployeeCard(employee.id, c.id)}
                                >
                                    <Trash2 size={12} /> Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-500">
                        No corporate cards yet.
                    </div>
                )}

                {/* Add card form */}
                <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Plus size={12} /> Add corporate card
                    </div>
                    <div className="grid md:grid-cols-4 gap-3 text-xs">
                        <div>
                            <label className="text-[11px] text-slate-500">Provider</label>
                            <input
                                className="input mt-1 h-8"
                                value={cardProvider}
                                onChange={e => setCardProvider(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Label</label>
                            <input
                                className="input mt-1 h-8"
                                value={cardLabel}
                                onChange={e => setCardLabel(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Last 4 digits</label>
                            <input
                                className="input mt-1 h-8"
                                value={cardLast4}
                                maxLength={4}
                                onChange={e => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="1234"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-500">Expiration (YYYY-MM)</label>
                            <input
                                type="month"
                                className="input mt-1 h-8"
                                value={cardExp}
                                onChange={e => setCardExp(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button className="btn-primary text-xs" onClick={handleAddCard}>
                            Save card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function prettyDocType(t: EmployeeDocumentType) {
    if (t === 'PASSPORT') return 'Passport'
    if (t === 'ID_CARD') return 'ID card'
    if (t === 'VISA') return 'Visa'
    return t
}

function calcDocsSummary(docs: { expirationDate: string; status: string }[]) {
    if (!docs || docs.length === 0) {
        return {
            label: 'No documents',
            className: 'text-slate-500',
            icon: <AlertCircle size={14} className="text-slate-400" />,
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const soon = new Date()
    soon.setDate(soon.getDate() + 60)
    const soonStr = soon.toISOString().slice(0, 10)

    const hasExpired = docs.some(d => d.expirationDate < todayStr)
    const hasSoon = docs.some(d => d.expirationDate >= todayStr && d.expirationDate <= soonStr)

    if (hasExpired) {
        return {
            label: 'Some documents expired',
            className: 'text-red-600',
            icon: <AlertCircle size={14} className="text-red-500" />,
        }
    }
    if (hasSoon) {
        return {
            label: 'Some documents expiring soon',
            className: 'text-amber-600',
            icon: <AlertCircle size={14} className="text-amber-500" />,
        }
    }
    return {
        label: 'All documents valid',
        className: 'text-emerald-600',
        icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    }
}