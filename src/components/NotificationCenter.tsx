// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, AlertTriangle, FileText, Clock3, CreditCard, FileCheck2, UserCircle2 } from 'lucide-react'

type NotificationType = 'DOC_EXPIRES' | 'DOC_READY' | 'POSTPAY_DUE' | 'TICKET_CHANGED' | 'EMPLOYEE_DOC_EXPIRED' | 'REPORT_READY'

type NotificationSeverity = 'info' | 'warning' | 'critical'

type NotificationItem = {
   id: string
   type: NotificationType
   title: string
   description: string
   createdAt: string
   severity: NotificationSeverity
   read: boolean
}

/** мок-данные уведомлений */
const seedNotifications: NotificationItem[] = [
   {
      id: 'n1',
      type: 'EMPLOYEE_DOC_EXPIRED',
      title: 'Документ сотрудника истёк',
      description: 'У Mariya Booker просрочен загранпаспорт. Проверьте документы перед следующей поездкой.',
      createdAt: '2025-11-26T10:15:00Z',
      severity: 'warning',
      read: false,
   },
   {
      id: 'n2',
      type: 'DOC_READY',
      title: 'Готовы закрывающие документы',
      description: 'Счёт и акт по заказу #A-20391 сформированы и доступны для скачивания.',
      createdAt: '2025-11-25T16:40:00Z',
      severity: 'info',
      read: false,
   },
   {
      id: 'n3',
      type: 'POSTPAY_DUE',
      title: 'Скоро срок оплаты по Postpay',
      description: 'По тарифу Postpay оплата за ноябрь должна быть произведена до 5 декабря.',
      createdAt: '2025-11-24T09:00:00Z',
      severity: 'critical',
      read: false,
   },
   {
      id: 'n4',
      type: 'REPORT_READY',
      title: 'Готов отчёт по расходам',
      description: 'Ежемесячный отчёт по расходам за октябрь доступен в разделе “Отчёты”.',
      createdAt: '2025-11-23T12:30:00Z',
      severity: 'info',
      read: true,
   },
]

export function NotificationCenter() {
   const nav = useNavigate()
   const [open, setOpen] = useState(false)
   const [items, setItems] = useState<NotificationItem[]>(seedNotifications)
   const panelRef = useRef<HTMLDivElement | null>(null)

   const unreadCount = items.filter(n => !n.read).length

   /* HOTKEY: Shift + N */
   useEffect(() => {
      const handler = (e: KeyboardEvent) => {
         if (e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault()
            setOpen(o => !o)
         }
         if (e.key === 'Escape') {
            setOpen(false)
         }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
   }, [])

   /* Close when clicking outside */
   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
            setOpen(false)
         }
      }
      if (open) {
         document.addEventListener('mousedown', handleClick)
      }
      return () => document.removeEventListener('mousedown', handleClick)
   }, [open])

   const toggleOpen = () => setOpen(o => !o)

   const markAllRead = () => {
      setItems(prev => prev.map(n => ({ ...n, read: true })))
   }

   const handleClickNotification = (n: NotificationItem) => {
      // помечаем прочитанным
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, read: true } : i)))

      // навигация в зависимости от типа
      switch (n.type) {
         case 'DOC_EXPIRES':
         case 'DOC_READY':
            nav('/documents')
            break
         case 'EMPLOYEE_DOC_EXPIRED':
            nav('/employees')
            break
         case 'POSTPAY_DUE':
            nav('/reports')
            break
         case 'TICKET_CHANGED':
            nav('/support')
            break
         case 'REPORT_READY':
            nav('/reports')
            break
         default:
            break
      }

      setOpen(false)
   }

   const severityBadge = (severity: NotificationSeverity) => {
      if (severity === 'critical') {
         return (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
               <AlertTriangle size={10} />
               Важно
            </span>
         )
      }
      if (severity === 'warning') {
         return (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
               <AlertTriangle size={10} />
               Внимание
            </span>
         )
      }
      return (
         <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
            <Clock3 size={10} />
            Инфо
         </span>
      )
   }

   const iconForType = (type: NotificationType) => {
      const common = 'shrink-0'
      switch (type) {
         case 'DOC_EXPIRES':
         case 'DOC_READY':
            return <FileCheck2 size={18} className={common + ' text-brand-600'} />
         case 'POSTPAY_DUE':
            return <CreditCard size={18} className={common + ' text-amber-600'} />
         case 'TICKET_CHANGED':
            return <FileText size={18} className={common + ' text-slate-600'} />
         case 'EMPLOYEE_DOC_EXPIRED':
            return <UserCircle2 size={18} className={common + ' text-rose-600'} />
         case 'REPORT_READY':
            return <CheckCircle2 size={18} className={common + ' text-emerald-600'} />
         default:
            return <FileText size={18} className={common + ' text-slate-600'} />
      }
   }

   const formatTime = (iso: string) => {
      try {
         const d = new Date(iso)
         return d.toLocaleString(undefined, {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
         })
      } catch {
         return ''
      }
   }

   return (
      <div className="relative" ref={panelRef}>
         {/* кнопка колокольчика */}
         <button
            type="button"
            onClick={toggleOpen}
            className="
          relative inline-flex items-center justify-center
          w-8 h-8 rounded-full border border-slate-200 bg-white
          hover:bg-slate-50 hover:border-slate-300
          transition-colors
        "
            title="Уведомления (Shift+N)"
         >
            <Bell size={16} className="text-slate-600" />
            {unreadCount > 0 && (
               <span
                  className="
              absolute -top-1 -right-1 min-w-[16px] h-4 px-1
              rounded-full bg-red-500 text-white text-[9px]
              flex items-center justify-center font-semibold
            "
               >
                  {unreadCount > 9 ? '9+' : unreadCount}
               </span>
            )}
         </button>

         {/* панель уведомлений */}
         {open && (
            <div
               className="
            absolute right-0 mt-2 w-80 bg-white rounded-xl
            shadow-xl border border-slate-200 z-50
          "
            >
               <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                     <span className="text-xs font-semibold text-slate-800">Уведомления</span>
                     <span className="text-[10px] text-slate-500">Shift+N — открыть / закрыть</span>
                  </div>
                  {unreadCount > 0 && (
                     <button className="text-[10px] text-brand-600 hover:text-brand-700" onClick={markAllRead}>
                        Отметить прочитанными
                     </button>
                  )}
               </div>

               <div className="max-h-80 overflow-y-auto py-1">
                  {items.length === 0 && <div className="px-3 py-4 text-xs text-slate-500">Уведомлений нет</div>}

                  {items.map(n => (
                     <button
                        key={n.id}
                        onClick={() => handleClickNotification(n)}
                        className={`
                  w-full text-left px-3 py-2 flex gap-2 text-xs
                  hover:bg-slate-50 transition-colors
                  ${!n.read ? 'bg-brand-50/40' : ''}
                `}
                     >
                        <div className="mt-0.5">{iconForType(n.type)}</div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between gap-2">
                              <span
                                 className={`
                        font-semibold truncate
                        ${!n.read ? 'text-slate-800' : 'text-slate-700'}
                      `}
                              >
                                 {n.title}
                              </span>
                              {severityBadge(n.severity)}
                           </div>
                           <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.description}</p>
                           <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock3 size={10} />
                              <span>{formatTime(n.createdAt)}</span>
                              {!n.read && <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />}
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
