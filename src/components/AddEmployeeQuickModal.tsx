// @ts-nocheck
import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../state/store'

export function AddEmployeeQuickModal({ open, onClose }) {
   const { addEmployee } = useStore()

   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [loading, setLoading] = useState(false)

   if (!open) return null

   const submit = async () => {
      if (!name.trim() || !email.trim()) return

      setLoading(true)

      // имитация сетевого запроса
      setTimeout(() => {
         addEmployee({
            name,
            email,
            role: 'BOOKER',
            documents: [],
            department: '',
         })

         setLoading(false)
         onClose()
      }, 600)
   }

   return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
         <div className="card w-80 p-4 relative border border-slate-200 shadow-lg bg-white rounded-xl">
            {/* header */}
            <div className="flex items-center justify-between mb-3">
               <h2 className="text-sm font-semibold text-slate-800">Добавить сотрудника</h2>
               <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                  <X size={16} />
               </button>
            </div>

            {/* form */}
            <div className="space-y-3">
               <div>
                  <label className="text-xs text-slate-500">Имя</label>
                  <input className="input text-xs mt-1" placeholder="Иван Иванов" value={name} onChange={e => setName(e.target.value)} />
               </div>

               <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input className="input text-xs mt-1" placeholder="ivan@company.com" value={email} onChange={e => setEmail(e.target.value)} />
               </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 mt-4">
               <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClose}>
                  Отмена
               </button>

               <button className="btn-primary text-xs px-4 py-1.5" onClick={submit} disabled={loading}>
                  {loading ? 'Создание…' : 'Создать'}
               </button>
            </div>
         </div>
      </div>
   )
}
