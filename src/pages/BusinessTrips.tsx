// src/pages/TripsPage.tsx
// @ts-nocheck
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { Trip, useStore } from '../state/store'
import { Filter, Plane, ShoppingCart, TrendingUp, FileDown, Download, FileSpreadsheet, FileText, Receipt, BriefcaseBusiness, ArrowRight } from 'lucide-react'

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED'
type TypeFilter = 'ALL' | 'single' | 'basket'

type DocType = 'invoice' | 'act' | 'receipt'

export default function TripsPage() {
   const { trips, employees, company } = useStore()
   const nav = useNavigate()

   // Мок, если стор пустой + связь с BusinessTrip через businessTripId
   const [demoTrips] = useState<Array<Trip & { businessTripId?: string }>>([
      {
         id: 'T1',
         title: 'Almaty → Astana (business trip)',
         total: 120000,
         type: 'single',
         status: 'COMPLETED',
         createdAt: '2025-11-10T09:00:00.000Z',
         employeeId: 'E1',
         businessTripId: 'BT1',
      },
      {
         id: 'T2',
         title: 'Almaty → Astana + hotel',
         total: 210000,
         type: 'single',
         status: 'IN_PROGRESS',
         createdAt: '2025-11-12T11:00:00.000Z',
         employeeId: 'E2',
         businessTripId: 'BT1',
      },
      {
         id: 'T4',
         title: 'Astana → Almaty (return)',
         total: 115000,
         type: 'single',
         status: 'CANCELLED',
         createdAt: '2025-11-18T08:15:00.000Z',
         employeeId: 'E1',
         businessTripId: 'BT1',
      },
      {
         id: 'T5',
         title: 'Almaty → Istanbul (Flex)',
         total: 380000,
         type: 'single',
         status: 'COMPLETED',
         createdAt: '2025-10-25T10:00:00.000Z',
         employeeId: 'E2',
         businessTripId: 'BT2',
      },
   ])

   const sourceTrips = trips.length > 0 ? trips : demoTrips

   const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
   const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
   const [departmentFilter, setDepartmentFilter] = useState<string>('ALL')
   const [dateFrom, setDateFrom] = useState<string>('')
   const [dateTo, setDateTo] = useState<string>('')

   // уникальные департаменты
   const departments = useMemo(() => {
      const set = new Set<string>()
      employees.forEach(e => {
         if (e.department) set.add(e.department)
      })
      return Array.from(set)
   }, [employees])

   // обогащённые поездки
   const enrichedTrips = useMemo(() => {
      return sourceTrips.map(t => {
         const employee = employees.find(e => e.id === t.employeeId)
         return {
            ...t,
            employeeName: employee?.name ?? 'Unknown',
            department: employee?.department ?? '',
            createdDate: new Date(t.createdAt),
         }
      })
   }, [sourceTrips, employees])

   // фильтрация
   const filteredTrips = useMemo(() => {
      return enrichedTrips.filter(t => {
         if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
         if (typeFilter !== 'ALL' && t.type !== typeFilter) return false
         if (departmentFilter !== 'ALL' && t.department !== departmentFilter) return false

         if (dateFrom) {
            const from = new Date(dateFrom)
            if (!Number.isNaN(from.getTime()) && t.createdDate < from) return false
         }
         if (dateTo) {
            const to = new Date(dateTo)
            if (!Number.isNaN(to.getTime()) && t.createdDate > to) return false
         }

         return true
      })
   }, [enrichedTrips, statusFilter, typeFilter, departmentFilter, dateFrom, dateTo])

   // сводка
   const summary = useMemo(() => {
      const count = filteredTrips.length
      const total = filteredTrips.reduce((sum, t) => sum + t.total, 0)
      const avg = count ? Math.round(total / count) : 0
      const completed = filteredTrips.filter(t => t.status === 'COMPLETED').length
      const cancelled = filteredTrips.filter(t => t.status === 'CANCELLED').length

      return { count, total, avg, completed, cancelled }
   }, [filteredTrips])

   const exportCsv = () => {
      if (filteredTrips.length === 0) return

      const header = ['Trip ID', 'Title', 'Employee', 'Department', 'Type', 'Status', 'CreatedAt', 'Amount']
      const rows = filteredTrips.map(t => [t.id, t.title, t.employeeName, t.department, t.type, t.status, t.createdDate.toISOString(), String(t.total)])
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'obt_trips_report.csv'
      a.click()
      URL.revokeObjectURL(url)
   }

   const handleDownloadSingle = (trip: any, docType: DocType) => {
      if (trip.status !== 'COMPLETED') {
         alert('Documents are available only for completed trips.')
         return
      }

      const label = docType === 'invoice' ? 'INVOICE' : docType === 'act' ? 'ACT' : 'RECEIPT'

      alert(`Simulated: download ${label} for trip ${trip.id}`)
   }

   const handleDownloadAll = (trip: any) => {
      if (trip.status !== 'COMPLETED') {
         alert('Documents are available only for completed trips.')
         return
      }

      alert(`Simulated: download all documents (invoice + act + receipt) as ZIP for trip ${trip.id}`)
   }

   const openBusinessTrip = (trip: any) => {
      if (!trip.businessTripId) {
         alert('This booking is not linked to a business trip in demo data.')
         return
      }
      nav(`/business-trips/${trip.businessTripId}`)
   }

   return (
      <div className="space-y-6">
         <SectionHeader
            title="Business trips"
            subtitle="List of business trips with basic analytics and document downloads"
            right={
               <button className="btn-ghost flex items-center gap-1 text-sm" onClick={exportCsv} disabled={filteredTrips.length === 0}>
                  <FileDown size={16} />
                  Export CSV
               </button>
            }
         />

         {/* Summary */}
         <div className="grid md:grid-cols-4 gap-4">
            <div className="card p-4">
               <div className="text-xs text-slate-500">Trips</div>
               <div className="text-2xl font-semibold mt-1">{summary.count}</div>
               <div className="text-xs text-slate-500 mt-1">After applying filters</div>
            </div>
            <div className="card p-4">
               <div className="text-xs text-slate-500">Total spend</div>
               <div className="text-2xl font-semibold mt-1">{summary.total.toLocaleString('ru-RU')} ₸</div>
               <div className="text-xs text-slate-500 mt-1">All amounts are demo values</div>
            </div>
            <div className="card p-4">
               <div className="text-xs text-slate-500">Avg per trip</div>
               <div className="text-2xl font-semibold mt-1">{summary.avg.toLocaleString('ru-RU')} ₸</div>
               <div className="text-xs text-slate-500 mt-1">Total / trips</div>
            </div>
            <div className="card p-4 bg-slate-50/60">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <TrendingUp size={14} /> Snapshot
               </div>
               <div className="text-xs text-slate-600 mt-1">
                  Completed: <b>{summary.completed}</b> · Cancelled: <b>{summary.cancelled}</b>
                  {company && (
                     <>
                        {' '}
                        · Tariff: <b>{company.tariff}</b>
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* Filters */}
         <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
               <Filter size={16} /> Filters
            </div>
            <div className="grid md:grid-cols-4 gap-3 text-xs">
               <div className="space-y-1">
                  <div className="text-slate-500">Status</div>
                  <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
                     <option value="ALL">All</option>
                     <option value="COMPLETED">Completed</option>
                     <option value="IN_PROGRESS">In progress</option>
                     <option value="CANCELLED">Cancelled</option>
                  </select>
               </div>

               <div className="space-y-1">
                  <div className="text-slate-500">Booking type</div>
                  <select className="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)}>
                     <option value="ALL">All</option>
                     <option value="single">Single tickets</option>
                     <option value="basket">Trip baskets</option>
                  </select>
               </div>

               <div className="space-y-1">
                  <div className="text-slate-500">Department</div>
                  <select className="select" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                     <option value="ALL">All</option>
                     {departments.map(d => (
                        <option key={d} value={d}>
                           {d}
                        </option>
                     ))}
                  </select>
               </div>

               <div className="space-y-1">
                  <div className="text-slate-500">Period</div>
                  <div className="grid grid-cols-2 gap-2">
                     <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                     <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  </div>
               </div>
            </div>
         </div>

         {/* Table */}
         <div className="card p-0 overflow-hidden">
            <div className="px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
               <span>{filteredTrips.length} trip(s) found</span>
               <span>Sort: newest first (demo)</span>
            </div>

            {filteredTrips.length === 0 && <div className="px-4 py-6 text-sm text-slate-500">No trips match current filters. Try resetting filters or changing period.</div>}

            {filteredTrips.length > 0 && (
               <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                     <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Trip</th>
                        <th className="px-4 py-2 text-left">Employee</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-left">Documents</th>
                        <th className="px-4 py-2 text-right">Download</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredTrips
                        .slice()
                        .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
                        .map(t => {
                           const docsAvailable = t.status === 'COMPLETED'
                           const hasBusinessTrip = !!t.businessTripId
                           return (
                              <tr key={t.id} className="border-t border-slate-100">
                                 <td className="px-4 py-2 align-top text-xs text-slate-500">{t.createdDate.toLocaleDateString()}</td>
                                 <td className="px-4 py-2 align-top">
                                    <div className="font-medium">{t.title}</div>
                                    {hasBusinessTrip && (
                                       <button
                                          type="button"
                                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900"
                                          onClick={() => openBusinessTrip(t)}
                                       >
                                          <BriefcaseBusiness size={11} />
                                          Open trip card
                                          <ArrowRight size={11} />
                                       </button>
                                    )}
                                 </td>
                                 <td className="px-4 py-2 align-top">
                                    <div>{t.employeeName}</div>
                                 </td>
                                 <td className="px-4 py-2 align-top text-xs text-slate-500">{t.department || '—'}</td>
                                 <td className="px-4 py-2 align-top text-xs">
                                    <TypeBadge type={t.type} />
                                 </td>
                                 <td className="px-4 py-2 align-top text-xs">
                                    <StatusBadge status={t.status} />
                                 </td>
                                 <td className="px-4 py-2 align-top text-right whitespace-nowrap">{t.total.toLocaleString('ru-RU')} ₸</td>
                                 <td className="px-4 py-2 align-top text-xs">
                                    <div className="flex flex-wrap gap-1">
                                       <DocPill label="Invoice" icon={<FileSpreadsheet size={11} />} disabled={!docsAvailable} onClick={() => handleDownloadSingle(t, 'invoice')} />
                                       <DocPill label="Act" icon={<FileText size={11} />} disabled={!docsAvailable} onClick={() => handleDownloadSingle(t, 'act')} />
                                       <DocPill label="Receipt" icon={<Receipt size={11} />} disabled={!docsAvailable} onClick={() => handleDownloadSingle(t, 'receipt')} />
                                    </div>
                                 </td>
                                 <td className="px-4 py-2 align-top text-right">
                                    <button
                                       className="btn-primary h-7 px-3 inline-flex items-center gap-1 text-xs disabled:opacity-50"
                                       disabled={!docsAvailable}
                                       onClick={() => handleDownloadAll(t)}
                                    >
                                       <Download size={12} />
                                       All
                                    </button>
                                 </td>
                              </tr>
                           )
                        })}
                  </tbody>
               </table>
            )}

            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
               This is a demo trips screen. In a real OBT you would see cost centers, project codes, real documents and deeper analytics.
            </div>
         </div>
      </div>
   )
}

/* === UI helpers === */

function DocPill({ label, icon, disabled, onClick }: { label: string; icon: React.ReactNode; disabled?: boolean; onClick: () => void }) {
   let base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition'

   if (disabled) {
      return (
         <span className={base + ' border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'}>
            {icon}
            {label} (n/a)
         </span>
      )
   }

   return (
      <button type="button" className={base + ' border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'} onClick={onClick}>
         <FileDown size={11} />
         {label}
      </button>
   )
}

function TypeBadge({ type }: { type: Trip['type'] }) {
   const Icon = type === 'single' ? Plane : ShoppingCart
   const label = type === 'single' ? 'Single' : 'Basket'
   return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
         <Icon size={12} />
         {label}
      </span>
   )
}

function StatusBadge({ status }: { status: Trip['status'] }) {
   let cls = 'bg-slate-50 text-slate-700 border-slate-200'
   let label: string = status

   if (status === 'COMPLETED') {
      cls = 'bg-emerald-50 text-emerald-700 border-emerald-200'
      label = 'Completed'
   } else if (status === 'IN_PROGRESS') {
      cls = 'bg-sky-50 text-sky-700 border-sky-200'
      label = 'In progress'
   } else if (status === 'CANCELLED') {
      cls = 'bg-rose-50 text-rose-700 border-rose-200'
      label = 'Cancelled'
   }

   return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}>{label}</span>
}
