// @ts-nocheck
import React, { useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'

import { BarChart2, FileDown, Filter, PieChart } from 'lucide-react'

import { Bar, BarChart, Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function PenaltiesPage() {
   // ==== МОК ДАННЫЕ ====
   const [penalties] = useState([
      {
         id: 'P1',
         employeeId: 'E1',
         employeeName: 'Игнат Админ',
         type: 'NO_SHOW',
         amount: 30000,
         date: '2025-11-12',
         status: 'UNPAID',
      },
      {
         id: 'P2',
         employeeId: 'E2',
         employeeName: 'Мария Координатор',
         type: 'POLICY_VIOLATION',
         amount: 15000,
         date: '2025-11-10',
         status: 'PAID',
      },
      {
         id: 'P3',
         employeeId: 'E1',
         employeeName: 'Игнат Админ',
         type: 'PAID_CANCELLATION',
         amount: 22000,
         date: '2025-11-02',
         status: 'UNPAID',
      },
      {
         id: 'P4',
         employeeId: 'E3',
         employeeName: 'Данияр Менеджер',
         type: 'LATE_BOOKING',
         amount: 8000,
         date: '2025-10-18',
         status: 'PAID',
      },
   ])

   // Русские ярлыки типов штрафов
   const typeLabels = {
      NO_SHOW: 'Неявка (no-show)',
      POLICY_VIOLATION: 'Нарушение политики',
      PAID_CANCELLATION: 'Платная отмена',
      LATE_BOOKING: 'Позднее бронирование',
      OUT_OF_POLICY_TIME: 'Вне политики (время)',
   }

   // ==== ФИЛЬТРЫ ====
   const [search, setSearch] = useState('')
   const [statusFilter, setStatusFilter] = useState('ALL')

   const filtered = useMemo(() => {
      return penalties.filter(p => {
         if (search.trim()) {
            const t = (p.employeeName + ' ' + typeLabels[p.type]).toLowerCase()
            if (!t.includes(search.toLowerCase())) return false
         }
         if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
         return true
      })
   }, [penalties, search, statusFilter])

   // ==== СВОДКА ====
   const summary = useMemo(() => {
      const total = filtered.reduce((s, p) => s + p.amount, 0)
      const unpaid = filtered.filter(p => p.status === 'UNPAID')
      return {
         total,
         unpaidCount: unpaid.length,
         unpaidSum: unpaid.reduce((s, p) => s + p.amount, 0),
      }
   }, [filtered])

   // ==== ГРАФИКИ ====
   const monthly = [
      { month: 'Авг', amount: 0 },
      { month: 'Сен', amount: 30000 },
      { month: 'Окт', amount: 8000 },
      { month: 'Ноя', amount: 67000 },
   ]

   // Распределение по типам
   const typeDistribution = useMemo(() => {
      const map = new Map()
      penalties.forEach(p => {
         map.set(p.type, (map.get(p.type) || 0) + p.amount)
      })
      return [...map.entries()].map(([type, value]) => ({
         name: typeLabels[type] || type,
         value,
      }))
   }, [penalties])

   const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa']

   // ТОП сотрудников
   const employeeTop = useMemo(() => {
      const map = new Map()
      penalties.forEach(p => {
         map.set(p.employeeName, (map.get(p.employeeName) || 0) + p.amount)
      })
      return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
   }, [penalties])

   // Экспорт CSV
   const exportCsv = () => {
      if (filtered.length === 0) return
      const header = ['ID', 'Сотрудник', 'Тип', 'Сумма', 'Дата', 'Статус']
      const rows = filtered.map(p => [p.id, p.employeeName, typeLabels[p.type], p.amount, p.date, p.status])
      const csv = [header, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'penalties.csv'
      a.click()
      URL.revokeObjectURL(url)
   }

   return (
      <div className="space-y-6">
         <SectionHeader
            title="Штрафы и нарушения"
            subtitle="Контроль нарушений политики, no-show и платных отмен"
            right={
               <button className="btn-ghost flex items-center gap-1 text-sm" onClick={exportCsv} disabled={filtered.length === 0}>
                  <FileDown size={16} /> Скачать CSV
               </button>
            }
         />

         {/* SUMMARY */}
         <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-4">
               <div className="text-xs text-slate-500">Общая сумма штрафов</div>
               <div className="text-2xl font-semibold mt-1">{summary.total.toLocaleString('ru-RU')} ₸</div>
            </div>

            <div className="card p-4">
               <div className="text-xs text-slate-500">Не оплачено</div>
               <div className="text-2xl font-semibold mt-1">{summary.unpaidSum.toLocaleString('ru-RU')} ₸</div>
            </div>

            <div className="card p-4">
               <div className="text-xs text-slate-500">Количество неоплаченных</div>
               <div className="text-2xl font-semibold mt-1">{summary.unpaidCount}</div>
            </div>
         </div>

         {/* CHARTS */}
         <div className="grid md:grid-cols-2 gap-4">
            {/* Месячная динамика */}
            <div className="card p-4">
               <div className="flex items-center gap-2 text-sm mb-3">
                  <BarChart2 size={16} /> Штрафы по месяцам
               </div>
               <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={monthly}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#3b82f6" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Распределение по типам */}
            <div className="card p-4">
               <div className="flex items-center gap-2 text-sm mb-3">
                  <PieChart size={16} /> Распределение по типам штрафов
               </div>
               <div className="h-48">
                  <ResponsiveContainer>
                     <RePieChart>
                        <Pie data={typeDistribution} dataKey="value" nameKey="name">
                           {typeDistribution.map((_, i) => (
                              <Cell key={i} fill={colors[i % colors.length]} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </RePieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* FILTERS */}
         <div className="card p-4 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600">
               <Filter size={14} />
               <span>Фильтры</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 w-full md:w-auto">
               <input className="input h-8 text-xs" placeholder="Поиск по сотруднику или типу..." value={search} onChange={e => setSearch(e.target.value)} />

               <select className="select h-8 text-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="ALL">Все</option>
                  <option value="UNPAID">Неоплаченные</option>
                  <option value="PAID">Оплаченные</option>
               </select>
            </div>
         </div>

         {/* TABLE */}
         <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm border-collapse">
               <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                     <th className="px-4 py-2 text-left">Сотрудник</th>
                     <th className="px-4 py-2 text-left">Тип</th>
                     <th className="px-4 py-2 text-left">Дата</th>
                     <th className="px-4 py-2 text-left">Статус</th>
                     <th className="px-4 py-2 text-right">Сумма</th>
                  </tr>
               </thead>

               <tbody>
                  {filtered.map(p => (
                     <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60 text-xs">
                        <td className="px-4 py-2">{p.employeeName}</td>
                        <td className="px-4 py-2">{typeLabels[p.type]}</td>
                        <td className="px-4 py-2">{p.date}</td>
                        <td className="px-4 py-2">
                           <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                 p.status === 'UNPAID' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                           >
                              {p.status === 'UNPAID' ? 'Неоплачен' : 'Оплачен'}
                           </span>
                        </td>

                        <td className="px-4 py-2 text-right">{p.amount.toLocaleString('ru-RU')} ₸</td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filtered.length === 0 && <div className="p-4 text-xs text-slate-500 text-center">Штрафов не найдено</div>}
         </div>
      </div>
   )
}
