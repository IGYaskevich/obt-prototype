// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Plane, Train, Building2, Users, Download, BarChart2, MessageSquare } from 'lucide-react'

import { AddEmployeeQuickModal } from './AddEmployeeQuickModal'

export function QuickActionFloatingButton({ open, setOpen }) {
   const nav = useNavigate()
   const [addOpen, setAddOpen] = useState(false) // <-- модалка сотрудника
   const ref = useRef<HTMLDivElement>(null)

   /* Detect OS */
   const isMac = navigator.platform.toUpperCase().includes('MAC')
   const hotkey = isMac ? '⇧ A' : 'Ctrl A'

   const actions = [
      { label: 'Купить авиабилет', icon: Plane, action: () => nav('/search?type=avia') },
      { label: 'Купить ЖД билет', icon: Train, action: () => nav('/search?type=rail') },
      { label: 'Найти отель', icon: Building2, action: () => nav('/search?type=hotel') },

      // ✔ здесь открываем МОДАЛКУ вместо перехода на новую страницу
      { label: 'Добавить сотрудника', icon: Users, action: () => setAddOpen(true) },

      { label: 'Скачать документы', icon: Download, action: () => nav('/documents?download=all') },
      // { label: 'Перейти в отчёты', icon: BarChart2, action: () => nav('/reports') },
      { label: 'Поддержка', icon: MessageSquare, action: () => nav('/support') },
   ]

   /* CLOSE ON CLICK OUTSIDE */
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target)) setOpen(false)
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
   }, [])

   return (
      <>
         {/* Floating button */}
         <div className="fixed bottom-20 right-5 z-20" ref={ref}>
            <button
               onClick={() => setOpen(o => !o)}
               className="
            flex items-center gap-2 px-3 py-2 rounded-full
            shadow-lg bg-brand-600 hover:bg-brand-700 text-white
            transition-all text-xs
          "
               title={`Быстрые действия (${hotkey})`}
            >
               <Zap size={14} className="text-white" />
               <span>{hotkey}</span>
            </button>

            {/* Dropdown panel */}
            {open && (
               <div
                  className="
              absolute bottom-12 right-0 w-56 bg-white
              shadow-xl border border-slate-200 rounded-lg p-2
              animate-fade-in
            "
               >
                  <div className="text-xs font-semibold text-slate-600 px-2 pb-2">Быстрые действия</div>

                  <div className="flex flex-col gap-1">
                     {actions.map((a, i) => (
                        <button
                           key={i}
                           onClick={() => {
                              a.action()
                              setOpen(false)
                           }}
                           className="
                    flex items-center gap-2 text-xs px-2 py-1.5
                    rounded-md hover:bg-slate-50 text-slate-700
                    transition-colors w-full text-left
                  "
                        >
                           <a.icon size={16} className="text-brand-600" />
                           {a.label}
                        </button>
                     ))}
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 px-2 border-t border-slate-200">{isMac ? 'Shift + A' : 'Ctrl + A'} — открыть меню</div>
               </div>
            )}
         </div>

         {/* МОДАЛКА быстрый сотрудник */}
         <AddEmployeeQuickModal open={addOpen} onClose={() => setAddOpen(false)} />
      </>
   )
}
