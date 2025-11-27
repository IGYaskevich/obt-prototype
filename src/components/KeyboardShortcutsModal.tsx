// @ts-nocheck
import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function KeyboardShortcutsModal({ open, onClose }) {
   if (!open) return null

   // закрытие по Esc
   useEffect(() => {
      const handler = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
   }, [onClose])

   const isMac = navigator.platform.toUpperCase().includes('MAC')

   return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
         <div className="card w-[420px] max-w-full p-4 border border-slate-200 bg-white rounded-xl shadow-xl">
            {/* header */}
            <div className="flex items-center justify-between mb-3">
               <div>
                  <h2 className="text-sm font-semibold text-slate-800">Горячие клавиши</h2>
                  <p className="text-[11px] text-slate-500">Ускорь работу с приложением с помощью сочетаний клавиш.</p>
               </div>
               <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                  <X size={16} />
               </button>
            </div>

            {/* content */}
            <div className="space-y-4 text-xs">
               <div>
                  <div className="font-semibold text-slate-700 mb-1">Навигация</div>
                  <div className="space-y-1">
                     <ShortcutRow combo="G D" label="Перейти на Dashboard" />
                     <ShortcutRow combo="G S" label="Поиск" />
                     <ShortcutRow combo="G E" label="Сотрудники" />
                     <ShortcutRow combo="G R" label="Отчёты" />
                     <ShortcutRow combo="G U" label="Документы" />
                     <ShortcutRow combo="G C" label="Настройки компании" />
                     <ShortcutRow combo="G T" label="Тарифы" />
                     <ShortcutRow combo="G P" label="Тревел-политики" />
                     <ShortcutRow combo="G H" label="Поддержка" />
                  </div>
               </div>

               <div>
                  <div className="font-semibold text-slate-700 mb-1">Действия и поиск</div>
                  <div className="space-y-1">
                     <ShortcutRow combo={isMac ? '⇧ A' : 'Ctrl A'} label="Открыть быстрые действия" />
                     <ShortcutRow combo={isMac ? '⌘ K' : 'Ctrl Shift K'} label="Открыть командную палитру (поиск)" />
                     <ShortcutRow combo={isMac ? '⌘ /' : 'Ctrl /'} label="Показать это окно подсказок" />
                     <ShortcutRow combo="Shift N" label="Открыть центр уведомлений" />
                  </div>
               </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400">Нажми Esc, чтобы закрыть окно.</div>
         </div>
      </div>
   )
}

function ShortcutRow({ combo, label }: { combo: string; label: string }) {
   return (
      <div className="flex items-center justify-between gap-2">
         <span className="text-slate-600">{label}</span>
         <span className="inline-flex items-center gap-1">
            {combo.split(' ').map((part, idx) => (
               <span
                  key={idx}
                  className="
              px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50
              text-[10px] font-mono text-slate-700
            "
               >
                  {part}
               </span>
            ))}
         </span>
      </div>
   )
}
