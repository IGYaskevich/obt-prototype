import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { Shield, Info, Clock, Plane, Check, Ban } from 'lucide-react'

export default function TravelPolicyPage() {
   const { travelPolicy } = useStore()

   const { softLimit, blockLimit, preferredFrom, preferredTo, allowedClasses, allowConnections, maxConnectionTime, handBaggageOnly } = travelPolicy

   return (
      <div className="space-y-6">
         <SectionHeader title="Тревел-политика" subtitle="Текущие правила компании, которые используются при поиске и бронировании." />

         {/* ОБЩАЯ ИНФОРМАЦИЯ */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
               <Shield size={18} className="mt-1 text-slate-600" />
               <div>
                  <div className="font-semibold">Общие правила</div>
                  <div className="text-xs text-slate-600 mt-1">
                     Эти параметры настраиваются администратором компании. Координаторы видят статус билетов как OK / WARN / BLOCK в выдаче поиска и в процессе бронирования.
                  </div>
               </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
               <div className="font-semibold text-[11px]">Логика стоимости</div>
               <ul className="list-disc list-inside space-y-1">
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="emerald" /> OK:
                     </span>{' '}
                     до {softLimit.toLocaleString('ru-RU')} ₸
                  </li>
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="amber" /> WARN:
                     </span>{' '}
                     {softLimit.toLocaleString('ru-RU')} — {blockLimit.toLocaleString('ru-RU')} ₸
                  </li>
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="red" /> BLOCK:
                     </span>{' '}
                     выше {blockLimit.toLocaleString('ru-RU')} ₸
                  </li>
               </ul>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
               <div className="font-semibold text-[11px]">Расписание и классы</div>
               <ul className="list-disc list-inside space-y-1">
                  <li>
                     Рекомендованное время вылета: {preferredFrom}–{preferredTo}
                  </li>
                  <li>Допустимые классы: {allowedClasses.join(', ') || '—'}</li>
                  <li>
                     Стыковки: {allowConnections ? 'разрешены' : 'запрещены'}
                     {allowConnections && ` • не более ${maxConnectionTime} мин`}
                  </li>
               </ul>
            </div>
         </div>

         {/* ПРАВИЛА СТОИМОСТИ */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
               <Plane size={16} className="text-slate-600" />
               <span className="font-semibold">Правила по стоимости перелёта</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
               <InfoBlock
                  title="Мягкий лимит (порог WARN)"
                  value={`${softLimit.toLocaleString('ru-RU')} ₸`}
                  description="Билеты выше этого значения отмечаются как WARN, но доступны для покупки."
               />

               <InfoBlock
                  title="Жёсткий лимит (BLOCK)"
                  value={`${blockLimit.toLocaleString('ru-RU')} ₸`}
                  description="Билеты дороже этого лимита блокируются и недоступны для оформления."
               />

               <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <Info size={14} className="mt-[2px]" />
                  <span>
                     Лимиты применяются к одному сегменту. Для сложных маршрутов система может оценивать каждый сегмент отдельно или общую стоимость — зависит от конфигурации.
                  </span>
               </div>
            </div>
         </div>

         {/* ВРЕМЯ ВЫЛЕТА */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
               <Clock size={16} className="text-slate-600" />
               <span className="font-semibold">Предпочтительное окно вылета</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
               <InfoBlock
                  title="Рекомендованное время"
                  value={`${preferredFrom} – ${preferredTo}`}
                  description="Рейсы вне окна отмечаются как WARN из-за несоответствия расписанию."
               />

               <div className="text-[11px] text-slate-600 md:col-span-2">
                  Это помогает направлять сотрудников к удобным времени вылета (например, избегать ночных рейсов), но не блокирует варианты полностью.
               </div>
            </div>
         </div>

         {/* КЛАССЫ И ДОП. ПРАВИЛА */}
         <div className="card p-4 grid md:grid-cols-2 gap-4 text-sm">
            {/* Allowed classes */}
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <Check size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Допустимые классы</span>
               </div>

               <div className="text-xs text-slate-600">
                  {allowedClasses.length ? (
                     <ul className="list-disc list-inside space-y-1">
                        {allowedClasses.map(c => (
                           <li key={c}>{c.replace('_', ' ')}</li>
                        ))}
                     </ul>
                  ) : (
                     <span>Не указано ни одного класса. В реальной системе это может блокировать все рейсы.</span>
                  )}
               </div>
            </div>

            {/* Extra rules */}
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <Ban size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Дополнительные правила</span>
               </div>

               <div className="text-xs text-slate-600 space-y-1">
                  <div>
                     Стыковки: <strong>{allowConnections ? 'разрешены' : 'запрещены'}</strong>
                     {allowConnections && ` (максимум ${maxConnectionTime} минут)`}
                  </div>

                  <div>
                     Только ручная кладь: <strong>{handBaggageOnly ? 'да' : 'нет'}</strong>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1">
                     Эти ограничения применяются дополнительно к стоимости и времени. В поиске отображаются в виде бейджей и подсказок.
                  </div>
               </div>
            </div>
         </div>

         {/* ЛЕГЕНДА */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="font-semibold">Как отображаются флаги в поиске и оформлении</div>

            <div className="flex flex-col md:flex-row gap-3 text-xs">
               <LegendItem color="bg-emerald-100 border-emerald-400" title="OK" text="Соответствует политике. Зеленый бейдж в результатах поиска." />

               <LegendItem color="bg-amber-100 border-amber-400" title="WARN" text="Разрешено, но есть отклонение по времени или мягкому ценовому лимиту." />

               <LegendItem color="bg-red-100 border-red-400" title="BLOCK" text="Не соответствует политике. Показывается заблокированным; оформить нельзя." />
            </div>
         </div>
      </div>
   )
}

/* ==== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ==== */

function InfoBlock({ title, value, description }: { title: string; value: string; description: string }) {
   return (
      <div className="text-xs text-slate-600 space-y-1">
         <div className="font-semibold text-[11px]">{title}</div>
         <div className="text-[13px] font-medium">{value}</div>
         <div className="text-[11px] text-slate-500">{description}</div>
      </div>
   )
}

function Dot({ color }: { color: 'emerald' | 'amber' | 'red' }) {
   const cls = color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-red-500'

   return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
}

function LegendItem({ color, title, text }: { color: string; title: string; text: string }) {
   return (
      <div className="flex items-start gap-2">
         <div className={`h-5 w-5 rounded border ${color}`} />
         <div>
            <div className="font-semibold text-[11px] mb-0.5">{title}</div>
            <div className="text-[11px] text-slate-600">{text}</div>
         </div>
      </div>
   )
}
