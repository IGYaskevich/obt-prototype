import React, {useMemo, useState} from 'react'
import SectionHeader from '../components/SectionHeader'
import {CreditCard, Download, FileDown, FileSpreadsheet, FileText, Filter, Receipt, Search,} from 'lucide-react'
import {useStore} from '../state/store'

type PaymentMethod = 'COMPANY_BALANCE' | 'POSTPAY' | 'CORP_CARD' | 'PERSONAL_CARD'

type DocumentRowStatus = 'READY' | 'PENDING' | 'NOT_AVAILABLE'

type DocumentRow = {
    id: string
    date: string // ISO
    tripTitle: string
    employeeName: string
    amount: number
    currency: string
    paymentMethod: PaymentMethod
    hasInvoice: DocumentRowStatus
    hasAct: DocumentRowStatus
    hasReceipt: DocumentRowStatus
}

export default function DocumentsPage() {
    const { company } = useStore()

    // Локальный мок: список заказов с документами
    const [rows] = useState<DocumentRow[]>([
        {
            id: 'D1',
            date: '2025-11-20',
            tripTitle: 'Almaty → Astana (Ignat Admin)',
            employeeName: 'Ignat Admin',
            amount: 42000,
            currency: 'KZT',
            paymentMethod: 'COMPANY_BALANCE',
            hasInvoice: 'READY',
            hasAct: 'READY',
            hasReceipt: 'READY',
        },
        {
            id: 'D2',
            date: '2025-11-22',
            tripTitle: 'Almaty → Astana (Mariya Coordinator)',
            employeeName: 'Mariya Coordinator',
            amount: 51000,
            currency: 'KZT',
            paymentMethod: 'POSTPAY',
            hasInvoice: 'READY',
            hasAct: 'PENDING',
            hasReceipt: 'READY',
        },
        {
            id: 'D3',
            date: '2025-11-23',
            tripTitle: 'Almaty → Astana (Personal card)',
            employeeName: 'Ignat Admin',
            amount: 36000,
            currency: 'KZT',
            paymentMethod: 'PERSONAL_CARD',
            hasInvoice: 'NOT_AVAILABLE',
            hasAct: 'NOT_AVAILABLE',
            hasReceipt: 'NOT_AVAILABLE',
        },
    ])

    // Фильтры
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] =
        useState<'ALL' | 'WITH_DOCS' | 'WITHOUT_DOCS'>('ALL')

    const filteredRows = useMemo(() => {
        return rows.filter(r => {
            if (search.trim()) {
                const text = (r.tripTitle + ' ' + r.employeeName + ' ' + r.id).toLowerCase()
                if (!text.includes(search.trim().toLowerCase())) return false
            }

            if (statusFilter === 'WITH_DOCS') {
                const anyDocReady =
                    r.hasInvoice === 'READY' || r.hasAct === 'READY' || r.hasReceipt === 'READY'
                if (!anyDocReady) return false
            }

            if (statusFilter === 'WITHOUT_DOCS') {
                const allMissing =
                    r.hasInvoice === 'NOT_AVAILABLE' &&
                    r.hasAct === 'NOT_AVAILABLE' &&
                    r.hasReceipt === 'NOT_AVAILABLE'
                if (!allMissing) return false
            }

            return true
        })
    }, [rows, search, statusFilter])

    const handleDownloadSingle = (row: DocumentRow, docType: 'invoice' | 'act' | 'receipt') => {
        const status =
            docType === 'invoice'
                ? row.hasInvoice
                : docType === 'act'
                    ? row.hasAct
                    : row.hasReceipt

        if (status === 'NOT_AVAILABLE') {
            alert('Documents are not available for this payment method (personal card).')
            return
        }
        if (status === 'PENDING') {
            alert('This document is still being generated. Please try again later.')
            return
        }

        // Эмуляция скачивания
        alert(`Downloading ${docType.toUpperCase()} for order ${row.id}`)
    }

    const handleDownloadAll = (row: DocumentRow) => {
        const anyReady =
            row.hasInvoice === 'READY' ||
            row.hasAct === 'READY' ||
            row.hasReceipt === 'READY'

        if (!anyReady) {
            alert('No documents available to download for this order.')
            return
        }

        alert(`Downloading all available documents as ZIP for order ${row.id}`)
    }

    return (
        <div className="space-y-5">
            <SectionHeader
                title="Documents"
                subtitle="List of completed bookings with closing documents (invoice, act, receipt)."
            />

            {/* Summary / hint */}
            <div className="card p-4 text-xs text-slate-600 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-2">
                    <FileText size={14} className="mt-[2px] text-slate-500" />
                    <span>
            Here you can see all bookings that produce closing documents. Payments from company
            balance, postpay or corporate card generate documents; personal card bookings do not.
          </span>
                </div>
                {company && (
                    <div className="text-right text-[11px] text-slate-500">
                        Current tariff:{' '}
                        <span className="badge-soft">
              {company.tariff}
            </span>
                        <br />
                        Documents logic depends on payment method and tariff configuration.
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                    <Filter size={14} />
                    <span>Filter documents</span>
                </div>
                <div className="grid gap-2 md:grid-cols-3 w-full md:w-auto">
                    <div>
                        <label className="text-[11px] text-slate-500">Search (trip, employee, order ID)</label>
                        <div className="relative mt-1">
                            <Search size={12} className="absolute left-2 top-2.5 text-slate-400" />
                            <input
                                className="input pl-7 h-8 text-xs"
                                placeholder="Type to search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500">Documents</label>
                        <select
                            className="select mt-1 h-8 text-xs"
                            value={statusFilter}
                            onChange={e =>
                                setStatusFilter(e.target.value as 'ALL' | 'WITH_DOCS' | 'WITHOUT_DOCS')
                            }
                        >
                            <option value="ALL">All bookings</option>
                            <option value="WITH_DOCS">With documents</option>
                            <option value="WITHOUT_DOCS">Without documents</option>
                        </select>
                    </div>
                    <div className="hidden md:block text-[11px] text-slate-400">
                        Use Reports page for detailed aggregation by period and payment methods.
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th className="px-3 py-2 text-left">Order</th>
                        <th className="px-3 py-2 text-left">Traveler</th>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Payment</th>
                        <th className="px-3 py-2 text-left">Documents</th>
                        <th className="px-3 py-2 text-right">Download</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRows.map(row => {
                        const anyReady =
                            row.hasInvoice === 'READY' ||
                            row.hasAct === 'READY' ||
                            row.hasReceipt === 'READY'
                        return (
                            <tr
                                key={row.id}
                                className="border-t border-slate-100 hover:bg-slate-50/60 text-xs"
                            >
                                <td className="px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{row.tripTitle}</span>
                                        <span className="text-[11px] text-slate-500">
                        #{row.id} • {row.date}
                      </span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-600">{row.employeeName}</td>
                                <td className="px-3 py-2 text-xs">
                                    {row.amount.toLocaleString('ru-RU')}{' '}
                                    <span className="text-slate-500">{row.currency}</span>
                                </td>
                                <td className="px-3 py-2 text-xs">
                                    <div className="inline-flex items-center gap-1">
                                        <CreditCard size={12} className="text-slate-500" />
                                        <span>{prettyPayment(row.paymentMethod)}</span>
                                    </div>
                                    {row.paymentMethod === 'PERSONAL_CARD' && (
                                        <div className="text-[10px] text-slate-500">
                                            No closing documents for personal card payments.
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-xs">
                                    <div className="flex flex-wrap gap-1">
                                        <DocBadge
                                            label="Invoice"
                                            status={row.hasInvoice}
                                            icon={<FileSpreadsheet size={11} />}
                                            onClick={() => handleDownloadSingle(row, 'invoice')}
                                        />
                                        <DocBadge
                                            label="Act"
                                            status={row.hasAct}
                                            icon={<FileText size={11} />}
                                            onClick={() => handleDownloadSingle(row, 'act')}
                                        />
                                        <DocBadge
                                            label="Receipt"
                                            status={row.hasReceipt}
                                            icon={<Receipt size={11} />}
                                            onClick={() => handleDownloadSingle(row, 'receipt')}
                                        />
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-xs text-right">
                                    <button
                                        className="btn-primary h-7 px-3  inline-flex items-center gap-1 disabled:opacity-50"
                                        disabled={!anyReady}
                                        onClick={() => handleDownloadAll(row)}
                                    >
                                        <Download size={12} />
                                        <span className='text-xs'>
                                                                                    Download all
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>

                {filteredRows.length === 0 && (
                    <div className="p-4 text-xs text-slate-500 text-center">
                        No bookings match current filters.
                    </div>
                )}
            </div>
        </div>
    )
}

function prettyPayment(method: PaymentMethod) {
    switch (method) {
        case 'COMPANY_BALANCE':
            return 'Company balance'
        case 'POSTPAY':
            return 'Postpay'
        case 'CORP_CARD':
            return 'Corporate card'
        case 'PERSONAL_CARD':
            return 'Personal card'
        default:
            return method
    }
}

function DocBadge({
                      label,
                      status,
                      icon,
                      onClick,
                  }: {
    label: string
    status: DocumentRowStatus
    icon: React.ReactNode
    onClick: () => void
}) {
    let className =
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] cursor-pointer transition'
    let text = label
    let disabled = false

    if (status === 'READY') {
        className +=
            ' border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
    } else if (status === 'PENDING') {
        className +=
            ' border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
        text = `${label} (pending)`
    } else if (status === 'NOT_AVAILABLE') {
        className +=
            ' border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
        text = `${label} (n/a)`
        disabled = true
    }

    if (disabled) {
        return (
            <span className={className}>
        {icon}
                {text}
      </span>
        )
    }

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
        >
            <FileDown size={11} />
            {text}
        </button>
    )
}