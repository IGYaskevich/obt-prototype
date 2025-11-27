// @ts-nocheck
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Train, Building2, Users, Download, BarChart2, PlusCircle, MessageSquare } from 'lucide-react'

export function QuickActions() {
   const nav = useNavigate()

   const actions = [
      {
         label: 'Купить авиабилет',
         icon: Plane,
         onClick: () => nav('/search?type=avia'),
      },
      {
         label: 'Купить ЖД билет',
         icon: Train,
         onClick: () => nav('/search?type=rail'),
      },
      {
         label: 'Найти отель',
         icon: Building2,
         onClick: () => nav('/search?type=hotel'),
      },
      {
         label: 'Добавить сотрудника',
         icon: Users,
         onClick: () => nav('/employees?add=1'),
      },
      {
         label: 'Скачать закрывающие за месяц',
         icon: Download,
         onClick: () => nav('/documents?download=month'),
      },
      {
         label: 'Посмотреть отчёты',
         icon: BarChart2,
         onClick: () => nav('/reports'),
      },
      {
         label: 'Быстрое бронирование',
         icon: PlusCircle,
         onClick: () => nav('/search'),
      },
      {
         label: 'Связаться с поддержкой',
         icon: MessageSquare,
         onClick: () => nav('/support'),
      },
   ]

   return (
      <div className="card p-4 mt-4">
         <h3 className="text-sm font-semibold text-slate-700 mb-3">Быстрые действия</h3>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((a, i) => (
               <button
                  key={i}
                  onClick={a.onClick}
                  className="
              flex flex-col items-center justify-center p-3
              rounded-lg border border-slate-200 bg-white
              hover:bg-slate-50 hover:border-slate-300
              transition-all shadow-sm hover:shadow
              text-xs text-slate-700 gap-1
            "
               >
                  <a.icon size={20} className="text-brand-600" />
                  <span className="text-center leading-tight">{a.label}</span>
               </button>
            ))}
         </div>
      </div>
   )
}
