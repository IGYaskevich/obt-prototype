// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useStore } from '../state/store'

export function AiAssistantPurchase() {
   const { selectedFlight, employees, getEmployeeById, employeeHasValidDocs } = useStore()

   const [open, setOpen] = useState(true)
   const [message, setMessage] = useState<string | null>(null)
   const [actions, setActions] = useState<any[]>([])

   // анализируем состояние каждые 400 мс
   useEffect(() => {
      if (!selectedFlight) return

      const selectedEmployee = employees.find(e => e.isSelected)

      // если сотрудник не выбран
      if (!selectedEmployee) {
         setMessage('Вы ещё не выбрали сотрудника. Кому оформляем билет?')
         setActions([{ label: 'Выбрать сотрудника', type: 'select-employee' }])
         return
      }

      // документы
      const valid = employeeHasValidDocs(selectedEmployee.id)

      if (!valid) {
         setMessage(`У ${selectedEmployee.name} нет валидных документов. Я могу помочь:`)
         setActions([
            { label: 'Добавить документ', type: 'add-doc' },
            { label: 'Выбрать другого сотрудника', type: 'change-employee' },
         ])
         return
      }

      // рекомендации по рейсу
      if (selectedFlight.refundable) {
         setMessage('Этот билет возвратный. Хотите добавить багаж или услуги?')
         setActions([
            { label: 'Добавить багаж', type: 'add-baggage' },
            { label: 'Нет, спасибо', type: 'close' },
         ])
         return
      }

      // общая рекомендация
      setMessage(`Маршрут ${selectedFlight.from} → ${selectedFlight.to}. Всё выглядит корректно. Могу подсказать по багажу или сотрудникам.`)
      setActions([
         { label: 'Добавить второго пассажира', type: 'add-passenger' },
         { label: 'Добавить багаж', type: 'add-baggage' },
      ])
   }, [selectedFlight, employees])

   const handleAction = (t: string) => {
      if (t === 'close') {
         setOpen(false)
         return
      }

      if (t === 'change-employee') {
         const evt = new CustomEvent('ai-change-employee')
         window.dispatchEvent(evt)
         return
      }

      if (t === 'add-doc') {
         const evt = new CustomEvent('ai-add-document')
         window.dispatchEvent(evt)
         return
      }

      if (t === 'add-baggage') {
         const evt = new CustomEvent('ai-add-baggage')
         window.dispatchEvent(evt)
         return
      }

      if (t === 'add-passenger') {
         const evt = new CustomEvent('ai-add-passenger')
         window.dispatchEvent(evt)
         return
      }
   }

   if (!open || !message) return null

   return (
      <div className="fixed bottom-24 right-4 z-30 w-72 bg-white card shadow-xl border border-slate-200 rounded-lg p-3 animate-fade-in">
         <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
               <MessageSquare size={18} className="text-brand-600" />
               <div className="text-xs font-semibold text-slate-700">AI-помощник</div>
            </div>
            <button className="p-1 rounded-full hover:bg-slate-100" onClick={() => setOpen(false)}>
               <X size={14} />
            </button>
         </div>

         <div className="text-xs text-slate-700 mt-2 whitespace-pre-line">{message}</div>

         <div className="mt-3 flex flex-col gap-1">
            {actions.map((a, i) => (
               <button
                  key={i}
                  onClick={() => handleAction(a.type)}
                  className="text-xs px-2 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-left w-full transition"
               >
                  {a.label}
               </button>
            ))}
         </div>
      </div>
   )
}
