import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { Trip, useStore } from '../state/store'
import { AlertTriangle, ArrowRight, Clock, CreditCard, FileText, LifeBuoy, Plane, ShieldCheck, TrendingUp, Users, Wallet } from 'lucide-react'
import { PenaltySummaryWidget } from '../components/PenaltySummaryWidget'

export default function DashboardPage() {
   const nav = useNavigate()
   const { company, trips, employees, hasPermission } = useStore()

   // Локальные мок-данные, если нет данных в сторах
   const [demoTrips] = useState<Trip[]>([
      {
         id: 'T1',
         title: 'Алматы → Астана (командировка)',
         total: 120000,
         type: 'single',
         status: 'COMPLETED',
         createdAt: '2025-11-10T09:00:00.000Z',
         employeeId: 'E1',
      },
      {
         id: 'T2',
         title: 'Алматы → Астана + отель',
         total: 210000,
         type: 'single',
         status: 'IN_PROGRESS',
         createdAt: '2025-11-12T11:00:00.000Z',
         employeeId: 'E2',
      },
      {
         id: 'T4',
         title: 'Астана → Алматы (обратный рейс)',
         total: 115000,
         type: 'single',
         status: 'CANCELLED',
         createdAt: '2025-11-18T08:15:00.000Z',
         employeeId: 'E1',
      },
      {
         id: 'T5',
         title: 'Алматы → Стамбул (Flex)',
         total: 380000,
         type: 'single',
         status: 'COMPLETED',
         createdAt: '2025-10-25T10:00:00.000Z',
         employeeId: 'E2',
      },
   ])

   const sourceTrips = trips.length > 0 ? trips : demoTrips
   if (!company) return null

   const canBuy = hasPermission('BUY')
   const canBuildTrip = hasPermission('BUILD_TRIP')

   /* --- АНАЛИТИКА --- */
   const analytics = useMemo(() => {
      const byStatus = (list: Trip[]) => ({
         COMPLETED: list.filter(t => t.status === 'COMPLETED').length,
         IN_PROGRESS: list.filter(t => t.status === 'IN_PROGRESS').length,
         CANCELLED: list.filter(t => t.status === 'CANCELLED').length,
      })

      const total = sourceTrips.length
      const flights = sourceTrips.filter(t => t.type === 'single')

      const allStatus = byStatus(sourceTrips)
      const flightsStatus = byStatus(flights)

      const monthly: Record<string, number> = {}
      sourceTrips.forEach(t => {
         const dt = new Date(t.createdAt)
         if (Number.isNaN(dt.getTime())) return
         const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
         monthly[key] = (monthly[key] || 0) + t.total
      })

      const monthlyItems = Object.entries(monthly)
         .sort(([a], [b]) => (a > b ? 1 : -1))
         .map(([month, value]) => ({ month, value }))

      const totalSpend = sourceTrips.reduce((sum, t) => sum + t.total, 0)

      return {
         total,
         totalSpend,
         allStatus,
         flightsStatus,
         monthlyItems,
      }
   }, [sourceTrips])

   /* --- АКТИВНОСТЬ СОТРУДНИКОВ --- */
   const employeeActivity = useMemo(() => {
      const byEmployee: Record<string, number> = {}
      sourceTrips.forEach(t => {
         if (!t.employeeId) return
         byEmployee[t.employeeId] = (byEmployee[t.employeeId] || 0) + 1
      })

      const topTravelers = Object.entries(byEmployee)
         .map(([id, count]) => {
            const emp = employees.find(e => e.id === id)
            return {
               id,
               name: emp?.name ?? 'Неизвестный сотрудник',
               dept: emp?.department ?? '',
               count,
            }
         })
         .sort((a, b) => b.count - a.count)
         .slice(0, 3)

      const docIssues = employees.filter(e => {
         if (!e.documents || e.documents.length === 0) return true
         return e.documents.some(d => d.status === 'EXPIRED')
      })

      return { topTravelers, docIssues }
   }, [sourceTrips, employees])

   const upcomingTrips = useMemo(() => {
      const relevant = sourceTrips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'COMPLETED')
      const withParsed = relevant
         .map(t => ({ ...t, date: new Date(t.createdAt) }))
         .filter(t => !Number.isNaN(t.date.getTime()))
         .sort((a, b) => a.date.getTime() - b.date.getTime())
      return withParsed.slice(0, 5)
   }, [sourceTrips])

   const compliance = useMemo(() => {
      const cancelled = sourceTrips.filter(t => t.status === 'CANCELLED').length
      const inProgress = sourceTrips.filter(t => t.status === 'IN_PROGRESS').length
      return { cancelled, inProgress }
   }, [sourceTrips])

   // Задачи для пользователя
   const inboxTasks: {
      id: string
      title: string
      description: string
      severity: 'high' | 'medium' | 'low'
      ctaLabel: string
      onClick: () => void
   }[] = []

   if (employeeActivity.docIssues.length > 0) {
      inboxTasks.push({
         id: 'docs',
         title: 'Проблемы с документами сотрудников',
         description: `${employeeActivity.docIssues.length} сотрудник(ов) с отсутствующими или просроченными документами.`,
         severity: 'medium',
         ctaLabel: 'Исправить документы',
         onClick: () => nav('/employees'),
      })
   }

   if ((company.tariff === 'POSTPAY' || company.tariff === 'FLEX') && company.postpayDueDays <= 7) {
      inboxTasks.push({
         id: 'postpay',
         title: 'Скоро срок оплаты Postpay',
         description: `Срок оплаты — через ${company.postpayDueDays} дней.`,
         severity: 'medium',
         ctaLabel: 'Посмотреть документы',
         onClick: () => nav('/documents'),
      })
   }

   if (!canBuy) {
      inboxTasks.push({
         id: 'role',
         title: 'Недостаточно прав',
         description: 'Ваша роль не позволяет оформлять билеты. Обратитесь к администратору.',
         severity: 'low',
         ctaLabel: 'Управление сотрудниками',
         onClick: () => nav('/employees'),
      })
   }

   return (
      <div className="space-y-6">
         <SectionHeader
            title="Дашборд компании"
            subtitle="Баланс, командировки, политика, штрафы и действия"
            right={
               <button className="btn-primary" disabled={!canBuy} onClick={() => canBuy && nav('/search')}>
                  Купить билет
               </button>
            }
         />

         {/* Баланс и тарифы */}
         <div className="grid md:grid-cols-4 gap-4">
            <div className="card p-4">
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Wallet size={16} /> Баланс
               </div>
               <div className="text-2xl font-semibold mt-1">{company.balance.toLocaleString()} ₸</div>
               <div className="text-xs text-slate-500 mt-1">Доступно для моментальной покупки</div>
            </div>

            <button className="card p-4 text-left hover:shadow-md transition" onClick={() => nav('/tariffs')}>
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CreditCard size={16} /> Тариф
               </div>
               <div className="text-2xl font-semibold mt-1">{company.tariff}</div>
               <div className="text-xs text-slate-500 mt-1">
                  {company.tariff === 'FREE' && 'Самообслуживание, оплата личной картой, без поддержки'}
                  {company.tariff === 'POSTPAY' && 'Отложенная оплата, поддержка, сервисные сборы'}
                  {company.tariff === 'FLEX' && 'VIP-поддержка, обмены/возвраты, интеграции'}
               </div>
               <div className="text-xs text-brand-600 mt-2">Подробнее →</div>
            </button>

            <div className="card p-4">
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <ShieldCheck size={16} /> Политики
               </div>
               <div className="text-lg font-semibold mt-1">Активна</div>
               <div className="text-xs text-slate-500 mt-1">Эконом-класс, лимит 120 000 ₸ за сегмент</div>
               <button className="btn-ghost mt-3" onClick={() => nav('/policies')}>
                  Открыть политики
               </button>
            </div>

            {company.tariff === 'POSTPAY' || company.tariff === 'FLEX' ? (
               <div className="card p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                     <Clock size={16} /> Postpay
                  </div>
                  <div className="text-lg font-semibold mt-1">Лимит: {company.postpayLimit.toLocaleString()} ₸</div>
                  <div className="text-xs text-slate-500 mt-1">Оплатить через {company.postpayDueDays} дней</div>
                  <div className="mt-3">
                     <MiniBarSingle label="Использовано (демо)" used={Math.round(company.postpayLimit * 0.35)} total={company.postpayLimit} />
                  </div>
               </div>
            ) : (
               <div className="card p-4 bg-slate-50/60">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                     <TrendingUp size={16} /> Улучшить тариф
                  </div>
                  <div className="text-sm font-semibold mt-1">Открыть Postpay и поддержку</div>
                  <div className="text-xs text-slate-500 mt-1">Перейдите на Postpay или Flex, чтобы открыть отложенную оплату и расширенные функции.</div>
                  <button className="btn-primary mt-3" onClick={() => nav('/tariffs')}>
                     Смотреть тарифы
                  </button>
               </div>
            )}
         </div>

         {/* KPI */}
         <div className="grid md:grid-cols-3 gap-4">
            <KpiCard title="Завершённые поездки" value={analytics.allStatus.COMPLETED} hint="Оформлены и выданы документы" accent="ok" />
            <KpiCard title="В процессе" value={analytics.allStatus.IN_PROGRESS} hint="Черновики и незавершённые заказы" />
         </div>

         {/* Статистика */}
         <div className="card p-4">
            <div className="flex items-center justify-between">
               <div className="text-sm font-medium">Распределение поездок</div>
               <div className="text-xs text-slate-500">
                  Всего: {analytics.total} · Сумма: {analytics.totalSpend.toLocaleString()} ₸
               </div>
            </div>

            <div className="mt-3 grid md:grid-cols-2 gap-4">
               <MiniBars
                  title="По статусу"
                  items={[
                     { label: 'Завершено', value: analytics.allStatus.COMPLETED },
                     { label: 'В процессе', value: analytics.allStatus.IN_PROGRESS },
                     { label: 'Отменено', value: analytics.allStatus.CANCELLED },
                  ]}
               />

               <MiniBars
                  title="По типу заказа"
                  items={[
                     {
                        label: 'Авиабилеты',
                        value: analytics.flightsStatus.COMPLETED + analytics.flightsStatus.IN_PROGRESS + analytics.flightsStatus.CANCELLED,
                     },
                  ]}
               />
            </div>
         </div>

         {/* Сотрудники + ближайшие поездки */}
         <div className="grid md:grid-cols-2 gap-4">
            {/* Активность сотрудников */}
            <div className="card p-4 space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                     <Users size={16} /> Активность сотрудников
                  </div>
                  <button className="btn-ghost text-xs" onClick={() => nav('/employees')}>
                     Управлять
                  </button>
               </div>

               <div className="text-xs text-slate-500">Топ путешественников</div>
               {employeeActivity.topTravelers.length === 0 && <div className="text-sm text-slate-500">Пока нет данных.</div>}

               <div className="space-y-2">
                  {employeeActivity.topTravelers.map(t => (
                     <div key={t.id} className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
                        <div>
                           <div className="font-medium">{t.name}</div>
                           <div className="text-xs text-slate-500">{t.dept || '—'}</div>
                        </div>
                        <div className="text-xs text-slate-600">{t.count} поездок</div>
                     </div>
                  ))}
               </div>

               <div className="text-xs text-slate-500 mt-3">Проблемы с документами</div>

               {employeeActivity.docIssues.length === 0 && (
                  <div className="text-xs text-emerald-700 bg-emerald-50/40 border border-emerald-200 rounded-lg p-2">Нет проблем с документами.</div>
               )}

               {employeeActivity.docIssues.length > 0 && (
                  <div className="space-y-1">
                     {employeeActivity.docIssues.map(e => (
                        <div key={e.id} className="text-xs text-amber-800 bg-amber-50/40 border border-amber-200 rounded-lg p-2">
                           {e.name} — отсутствуют или просрочены документы
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Ближайшие поездки */}
            <div className="card p-4 space-y-3">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                     <Clock size={16} /> Скорые / активные поездки
                  </div>
                  <button className="btn-ghost text-xs" onClick={() => nav('/documents')}>
                     Все поездки
                  </button>
               </div>

               {upcomingTrips.length === 0 && <div className="text-sm text-slate-500">Нет активных поездок.</div>}

               <div className="space-y-2">
                  {upcomingTrips.map(t => (
                     <div key={t.id} className="flex items-center justify-between text-sm border-t border-slate-100 pt-2">
                        <div>
                           <div>{t.title}</div>
                           <div className="text-xs text-slate-500">
                              {t.type === 'single' ? 'Авиабилет' : 'Командировка'} · {statusLabel(t.status)}
                           </div>
                        </div>
                        <div className="text-xs text-slate-600">{t.total.toLocaleString()} ₸</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Политики + расходы */}
         <div className="grid md:grid-cols-2 gap-4">
            {/* Политики */}
            <div className="card p-4 space-y-3">
               <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle size={16} /> Политика и соответствие
               </div>

               <div className="grid grid-cols-3 gap-2 text-xs">
                  <SmallKpi label="Отменено" value={compliance.cancelled} warn />
               </div>

               <div className="text-xs text-slate-500 mt-2">В прототипе поездки со статусом “Needs approval” считаются потенциальными нарушениями политик.</div>
            </div>

            {/* Расходы по месяцам */}
            <div className="card p-4 space-y-3">
               <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp size={16} /> Аналитика расходов
               </div>

               {analytics.monthlyItems.length === 0 && <div className="text-sm text-slate-500">Нет данных. После покупок здесь появится тренд расходов.</div>}

               {analytics.monthlyItems.length > 0 && (
                  <div className="space-y-2">
                     {analytics.monthlyItems.map(m => (
                        <div key={m.month}>
                           <div className="flex items-center justify-between text-xs">
                              <span>{m.month}</span>
                              <span>{m.value.toLocaleString()} ₸</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-brand-500/70" style={{ width: `${Math.min(100, (m.value / (analytics.totalSpend || 1)) * 100 * 1.5)}%` }} />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Быстрые действия */}
         <div className="grid md:grid-cols-3 gap-4">
            <Action title="Авиабилеты / ЖД" icon={Plane} onClick={() => nav('/search')} disabled={!canBuy} />
            <Action title="Закрывающие документы" icon={FileText} onClick={() => nav('/business-trips')} />
            <Action title="Политики и согласования" icon={ShieldCheck} onClick={() => nav('/policies')} />
            <Action title="Сотрудники и доступы" icon={Users} onClick={() => nav('/employees')} />
            <Action title={company.tariff === 'FLEX' ? 'VIP-поддержка 24/7' : 'Поддержка / FAQ'} icon={LifeBuoy} onClick={() => nav('/support')} />
            <PenaltySummaryWidget />
         </div>

         {/* Новости */}
         <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
               <div className="text-sm font-medium">Обновления продукта (демо)</div>
               <ul className="text-xs text-slate-600 mt-1 list-disc pl-4 space-y-1">
                  <li>Добавлен поиск ЖД-билетов в общий флоу.</li>
                  <li>Проверка документов сотрудников при покупке.</li>
                  <li>Скачивание закрывающих документов по одной поездке или всех сразу.</li>
               </ul>
            </div>
            <button className="btn-ghost text-xs" onClick={() => nav('/support')}>
               Смотреть все обновления
            </button>
         </div>
      </div>
   )
}

/* === ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ === */

function KpiCard({ title, value, hint, accent, onClick }: { title: string; value: number; hint: string; accent?: 'warn' | 'ok'; onClick?: () => void }) {
   return (
      <button onClick={onClick} className={`card p-4 text-left transition ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}>
         <div className="text-sm text-slate-500">{title}</div>
         <div className={`text-2xl font-semibold mt-1 ${accent === 'warn' ? 'text-amber-700' : accent === 'ok' ? 'text-emerald-700' : ''}`}>{value}</div>
         <div className="text-xs text-slate-500 mt-1">{hint}</div>
      </button>
   )
}

function MiniBars({ title, items }: { title: string; items: { label: string; value: number }[] }) {
   const max = Math.max(1, ...items.map(i => i.value))
   return (
      <div>
         <div className="text-xs text-slate-500 mb-2">{title}</div>
         <div className="space-y-2">
            {items.map(i => (
               <div key={i.label}>
                  <div className="flex items-center justify-between text-sm">
                     <span>{i.label}</span>
                     <span className="text-slate-500">{i.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                     <div className="h-full bg-brand-500/70" style={{ width: `${(i.value / max) * 100}%` }} />
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

function MiniBarSingle({ label, used, total }: { label: string; used: number; total: number }) {
   const pct = total ? Math.min(100, (used / total) * 100) : 0
   return (
      <div className="space-y-1 text-xs">
         <div className="flex items-center justify-between">
            <span>{label}</span>
            <span>
               {used.toLocaleString()} / {total.toLocaleString()} ₸
            </span>
         </div>
         <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500/70" style={{ width: `${pct}%` }} />
         </div>
      </div>
   )
}

function SmallKpi({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
   return (
      <div className={`rounded-xl border border-slate-100 p-3 ${warn && value > 0 ? 'bg-amber-50/60 border-amber-200' : ''}`}>
         <div className="text-xs text-slate-500">{label}</div>
         <div className={`text-lg font-semibold mt-0.5 ${warn && value > 0 ? 'text-amber-700' : ''}`}>{value}</div>
      </div>
   )
}

function Action({ title, icon: Icon, onClick, disabled }: { title: string; icon: any; onClick: () => void; disabled?: boolean }) {
   return (
      <button
         onClick={() => !disabled && onClick()}
         className={`card p-4 text-left transition flex flex-col justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-sm">
               <Icon size={18} /> {title}
            </div>
            <ArrowRight size={16} className="text-slate-400" />
         </div>
      </button>
   )
}

function statusLabel(s: any) {
   switch (s) {
      case 'COMPLETED':
         return 'Завершено'
      case 'IN_PROGRESS':
         return 'В процессе'
      case 'CANCELLED':
         return 'Отменено'
      default:
         return String(s)
   }
}
