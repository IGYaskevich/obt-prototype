import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { ArrowRight, BriefcaseBusiness, CalendarDays, User, AlertTriangle } from 'lucide-react'

export default function BusinessTripsPage() {
   const { businessTrips, employees } = useStore()
   const nav = useNavigate()

   const tripsWithMeta = useMemo(
      () =>
         businessTrips.map(bt => {
            const owner = employees.find(e => e.id === bt.ownerEmployeeId)
            const total = bt.services.reduce((sum, s) => sum + s.amount, 0)
            return {
               ...bt,
               ownerName: owner?.name ?? 'Без ответственного',
               ownerEmail: owner?.email ?? '',
               total,
            }
         }),
      [businessTrips, employees],
   )

   const sortedTrips = useMemo(
      () =>
         [...tripsWithMeta].sort((a, b) => {
            // сортируем по дате начала (последние выше)
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
         }),
      [tripsWithMeta],
   )

   return (
      <div className="space-y-5">
         <SectionHeader title="Командировки" subtitle="Список командировок компании: перелёты, отели, ЖД и другие услуги, собранные в единый кейс." />

         {sortedTrips.length === 0 && (
            <div className="card p-4 flex items-center gap-2 text-sm text-slate-600">
               <AlertTriangle size={16} className="text-amber-500" />
               <span>Пока нет ни одной командировки в демо-данных.</span>
            </div>
         )}

         {sortedTrips.length > 0 && (
            <div className="card p-0 overflow-hidden">
               <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                     <tr>
                        <th className="px-3 py-2 text-left">Командировка</th>
                        <th className="px-3 py-2 text-left">Период</th>
                        <th className="px-3 py-2 text-left">Ответственный</th>
                        <th className="px-3 py-2 text-left">Статус</th>
                        <th className="px-3 py-2 text-right">Сумма</th>
                        <th className="px-3 py-2 text-right">Действия</th>
                     </tr>
                  </thead>
                  <tbody>
                     {sortedTrips.map(trip => (
                        <tr key={trip.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                           <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                 <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-50 border border-slate-200">
                                    <BriefcaseBusiness size={14} className="text-slate-600" />
                                 </span>
                                 <div className="flex flex-col">
                                    <span className="font-medium">{trip.name}</span>
                                    <span className="text-[11px] text-slate-500">Услуг: {trip.services.length}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-3 py-2 text-xs text-slate-600">
                              <div className="inline-flex items-center gap-1">
                                 <CalendarDays size={12} />
                                 <span>
                                    {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                                 </span>
                              </div>
                           </td>
                           <td className="px-3 py-2 text-xs text-slate-600">
                              <div className="flex items-center gap-1">
                                 <User size={12} className="text-slate-500" />
                                 <div className="flex flex-col">
                                    <span>{trip.ownerName}</span>
                                    {trip.ownerEmail && <span className="text-[11px] text-slate-500">{trip.ownerEmail}</span>}
                                 </div>
                              </div>
                           </td>
                           <td className="px-3 py-2 text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${getTripStatusClass(trip.status)}`}>
                                 {getTripStatusLabel(trip.status)}
                              </span>
                           </td>
                           <td className="px-3 py-2 text-xs text-right">
                              {trip.total.toLocaleString('ru-RU')} <span className="text-slate-500">KZT</span>
                           </td>
                           <td className="px-3 py-2 text-xs text-right">
                              <button className="btn-ghost inline-flex items-center gap-1" onClick={() => nav(`/business-trips/${trip.id}`)}>
                                 Открыть
                                 <ArrowRight size={14} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   )
}

/* Вспомогательные функции — такие же, как на странице карточки командировки */

function getTripStatusLabel(status: any) {
   switch (status) {
      case 'PLANNED':
         return 'Запланирована'
      case 'IN_PROGRESS':
         return 'В процессе'
      case 'COMPLETED':
         return 'Завершена'
      case 'CANCELLED':
         return 'Отменена'
      default:
         return String(status)
   }
}

function getTripStatusClass(status: any) {
   switch (status) {
      case 'PLANNED':
         return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'IN_PROGRESS':
         return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'COMPLETED':
         return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CANCELLED':
         return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
         return 'bg-slate-50 text-slate-700 border-slate-200'
   }
}

function formatDate(iso: string) {
   if (!iso) return '—'
   const d = new Date(iso)
   if (Number.isNaN(d.getTime())) return iso
   return d.toLocaleDateString('ru-RU')
}
