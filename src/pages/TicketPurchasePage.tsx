import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { ArrowLeft, AlertTriangle, CheckCircle2, Loader2, User, Users, Plus, Trash2, CreditCard, Building2, FileText, Sparkles } from 'lucide-react'

type PassengerKind = 'EMPLOYEE' | 'GUEST'

type PassengerEmployee = {
   id: string
   kind: 'EMPLOYEE'
   employeeId: string
}

type PassengerGuest = {
   id: string
   kind: 'GUEST'
   fullName: string
   relation: string
   docNumber: string
   docExpiration: string
}

type Passenger = PassengerEmployee | PassengerGuest

type PaymentMethod = 'COMPANY_BALANCE' | 'CORP_CARD' | 'POSTPAY' | 'PERSONAL_CARD'
type PurchaseStatus = 'IDLE' | 'PROCESSING' | 'DONE'

export default function TicketPurchasePage() {
   const nav = useNavigate()

   const {
      company,
      selectedFlight,
      employees,
      getEmployeeById,
      employeeHasValidDocs,
      travelPolicy,
      addTrip,
      addPolicyViolationPenalty, // ← ДОБАВЛЕНО
   } = useStore()

   if (!company) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Оформление" subtitle="Контекст компании отсутствует. Пожалуйста, войдите заново." />
            <div className="card p-4 text-sm text-red-600">Компания не найдена в текущей сессии.</div>
         </div>
      )
   }

   if (!selectedFlight) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Оформление" subtitle="Выберите рейс перед покупкой." />
            <div className="card p-4 text-sm flex items-center justify-between">
               <span>Рейс не выбран.</span>
               <button className="btn-primary flex items-center gap-1 text-xs" onClick={() => nav('/search')}>
                  <ArrowLeft size={14} />
                  Назад к поиску
               </button>
            </div>
         </div>
      )
   }

   // ------------------ POLICY CHECK -----------------------

   const timeToMinutes = (hhmm: string): number => {
      const [h, m] = hhmm.split(':').map(Number)
      if (Number.isNaN(h) || Number.isNaN(m)) return 0
      return h * 60 + m
   }

   const flightPolicy: 'OK' | 'WARN' | 'BLOCK' = useMemo(() => {
      const { softLimit, blockLimit, preferredFrom, preferredTo } = travelPolicy
      const price = selectedFlight.price
      let result: 'OK' | 'WARN' | 'BLOCK' = 'OK'

      if (price > blockLimit) {
         result = 'BLOCK'
      } else if (price >= softLimit) {
         result = 'WARN'
      }

      const depMinutes = timeToMinutes(selectedFlight.depart)
      const fromMinutes = timeToMinutes(preferredFrom)
      const toMinutes = timeToMinutes(preferredTo)

      if (result !== 'BLOCK') {
         if (depMinutes < fromMinutes || depMinutes > toMinutes) {
            if (result === 'OK') result = 'WARN'
         }
      }

      return result
   }, [selectedFlight, travelPolicy])

   const flightPolicyLabel = flightPolicy === 'OK' ? 'В пределах политики' : flightPolicy === 'WARN' ? 'Допустимо с предупреждением' : 'Заблокировано политикой'

   const flightPolicyBadgeClass =
      flightPolicy === 'OK'
         ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
         : flightPolicy === 'WARN'
           ? 'bg-amber-50 text-amber-700 border border-amber-200'
           : 'bg-red-50 text-red-700 border-red-200'

   // ------------------ PASSENGERS -----------------------

   const defaultEmployee = employees[0]

   const [passengers, setPassengers] = useState<Passenger[]>(
      defaultEmployee
         ? [
              {
                 id: crypto.randomUUID(),
                 kind: 'EMPLOYEE',
                 employeeId: defaultEmployee.id,
              },
           ]
         : [],
   )

   const [employeeToAdd, setEmployeeToAdd] = useState(defaultEmployee?.id || '')

   const [guestFullName, setGuestFullName] = useState('')
   const [guestRelation, setGuestRelation] = useState('')
   const [guestDocNumber, setGuestDocNumber] = useState('')
   const [guestDocExpiration, setGuestDocExpiration] = useState('')

   const addEmployeePassenger = () => {
      if (!employeeToAdd) return
      setPassengers(prev => [...prev, { id: crypto.randomUUID(), kind: 'EMPLOYEE', employeeId: employeeToAdd }])
   }

   const addGuestPassenger = () => {
      if (!guestFullName.trim()) return
      setPassengers(prev => [
         ...prev,
         {
            id: crypto.randomUUID(),
            kind: 'GUEST',
            fullName: guestFullName.trim(),
            relation: guestRelation.trim() || 'Гость',
            docNumber: guestDocNumber.trim(),
            docExpiration: guestDocExpiration.trim(),
         },
      ])
      setGuestFullName('')
      setGuestRelation('')
      setGuestDocNumber('')
      setGuestDocExpiration('')
   }

   const removePassenger = (id: string) => setPassengers(prev => prev.filter(p => p.id !== id))

   const passengersCount = passengers.length
   const firstEmployeePassenger = passengers.find(p => p.kind === 'EMPLOYEE') as PassengerEmployee | undefined

   // ------------------ PAYMENT -----------------------

   const allowedPaymentMethods: PaymentMethod[] = useMemo(() => {
      switch (company.tariff) {
         case 'FREE':
            return ['PERSONAL_CARD', 'COMPANY_BALANCE', 'CORP_CARD']
         case 'POSTPAY':
            return ['COMPANY_BALANCE', 'POSTPAY', 'CORP_CARD']
         case 'FLEX':
         default:
            return ['COMPANY_BALANCE', 'POSTPAY', 'CORP_CARD', 'PERSONAL_CARD']
      }
   }, [company.tariff])

   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(allowedPaymentMethods[0])
   const closingDocsAvailable = paymentMethod !== 'PERSONAL_CARD'

   const paymentLabel = (m: PaymentMethod) => {
      switch (m) {
         case 'COMPANY_BALANCE':
            return 'Баланс компании'
         case 'CORP_CARD':
            return 'Корпоративная карта'
         case 'POSTPAY':
            return 'Отложенный платёж (Postpay)'
         case 'PERSONAL_CARD':
            return 'Личная карта'
      }
   }

   // ------------------ PURCHASE -----------------------

   const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('IDLE')

   const totalAmount = useMemo(() => selectedFlight.price * Math.max(passengersCount, 1), [selectedFlight.price, passengersCount])

   const canPurchase = passengersCount > 0 && flightPolicy !== 'BLOCK' && purchaseStatus !== 'PROCESSING'

   const handlePurchase = () => {
      if (!canPurchase) return

      setPurchaseStatus('PROCESSING')

      setTimeout(() => {
         // создаём трип
         addTrip({
            title: `${selectedFlight.from} → ${selectedFlight.to} • ${passengersCount} пассажиров`,
            total: totalAmount,
            // @ts-ignore
            type: 'single',
            status: 'COMPLETED',
            employeeId: firstEmployeePassenger?.employeeId,
         })

         // === ДОБАВЛЕННО: автоматическое создание штрафа ===
         if (flightPolicy === 'WARN' && firstEmployeePassenger) {
            const penaltyAmount = Math.round(totalAmount * 0.1) // условно 10%
            addPolicyViolationPenalty({
               employeeId: firstEmployeePassenger.employeeId,
               amount: penaltyAmount,
               reason: 'Покупка билета вне travel-политики (soft-limit или неподходящее время вылета)',
            })
         }

         setPurchaseStatus('DONE')
      }, 1200)
   }

   const handleDownloadTickets = () => {
      alert('Заглушка: скачивание билетов (PDF)')
   }

   const handleDownloadAllDocs = () => {
      if (!closingDocsAvailable) {
         alert('Закрывающие документы недоступны для оплаты личной картой')
         return
      }
      alert('Заглушка: скачивание полного пакета документов')
   }

   // ------------------ AI ASSISTANT -----------------------

   const hasDocsIssues = passengers.some(p => p.kind === 'EMPLOYEE' && !employeeHasValidDocs((p as PassengerEmployee).employeeId))

   const aiHints: string[] = []
   if (passengersCount === 0) aiHints.push('Добавьте хотя бы одного пассажира.')
   else aiHints.push(`Пассажиров в заказе: ${passengersCount}.`)

   if (hasDocsIssues) aiHints.push('У некоторых сотрудников нет валидных документов. Проверьте паспорта/ID.')

   if (flightPolicy === 'WARN') aiHints.push('Рейс выходит за мягкие ограничения travel-политики (WARN). В реальном OBT могло бы требоваться согласование.')

   if (flightPolicy === 'BLOCK') aiHints.push('Рейс заблокирован политикой. Покупка невозможна.')

   if (paymentMethod === 'PERSONAL_CARD') aiHints.push('При оплате личной картой закрывающие документы обычно не формируются.')

   if (company.tariff === 'POSTPAY') aiHints.push(`Тариф Postpay: счёт должен быть оплачен компанией в течение ${company.postpayDueDays} дней.`)

   if (company.tariff === 'FLEX') aiHints.push('Тариф Flex: расширенные условия возврата и обменов.')

   const hasProblems = hasDocsIssues || flightPolicy !== 'OK'

   // ------------------ RENDER -----------------------

   return (
      <div className="space-y-6">
         <SectionHeader title="Оформление" subtitle="Добавьте пассажиров, выберите оплату и подтвердите покупку." />

         <button className="text-xs text-slate-500 flex items-center gap-1 mb-2" onClick={() => nav(-1)}>
            <ArrowLeft size={14} />
            Назад
         </button>

         {/* 1. Информация о рейсе */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
               <div className="text-xs text-slate-500">Рейс</div>
               <div className="font-semibold">
                  {selectedFlight.from} → {selectedFlight.to}
               </div>
               <div className="text-xs text-slate-600">
                  {selectedFlight.date} • {selectedFlight.depart} – {selectedFlight.arrive}
               </div>
               <div className="text-xs text-slate-600">Авиакомпания: {selectedFlight.carrier}</div>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
               <div className="font-semibold text-[11px]">Цена и политика</div>
               <div>
                  Цена за пассажира: <b>{selectedFlight.price.toLocaleString('ru-RU')} ₸</b>
               </div>
               <div>
                  Всего ({passengersCount} чел): <b>{totalAmount.toLocaleString('ru-RU')} ₸</b>
               </div>
               <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${flightPolicyBadgeClass}`}>{flightPolicy}</span>
                  <span className="text-[11px] text-slate-600">{flightPolicyLabel}</span>
               </div>
            </div>

            <div className="text-xs text-slate-500 flex items-start gap-2">
               <AlertTriangle size={14} className="mt-[2px] text-slate-400" />
               Ограничения политики настраиваются администратором в настройках компании.
            </div>
         </div>

         {/* 2. Пассажиры */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Пассажиры</span>
               </div>
               <div className="text-xs text-slate-500">Сотрудники и гости.</div>
            </div>

            {/* Добавить сотрудника */}
            <div className="grid md:grid-cols-2 gap-4 text-xs">
               <div className="space-y-2">
                  <div className="font-semibold text-[11px]">Добавить сотрудника</div>
                  <div className="flex gap-2">
                     <select className="select h-8 text-xs flex-1" value={employeeToAdd} onChange={e => setEmployeeToAdd(e.target.value)}>
                        {employees.map(e => (
                           <option key={e.id} value={e.id}>
                              {e.name} ({e.email})
                           </option>
                        ))}
                     </select>

                     <button className="btn-primary h-8 px-3 flex items-center gap-1 text-[11px]" onClick={addEmployeePassenger}>
                        <Plus size={12} />
                        Добавить
                     </button>
                  </div>
               </div>

               {/* Добавить гостя */}
               <div className="space-y-2">
                  <div className="font-semibold text-[11px]">Добавить гостя</div>
                  <div className="grid grid-cols-2 gap-2">
                     <input className="input h-8 text-xs" placeholder="ФИО" value={guestFullName} onChange={e => setGuestFullName(e.target.value)} />
                     <input className="input h-8 text-xs" placeholder="Отношение (например, супруг)" value={guestRelation} onChange={e => setGuestRelation(e.target.value)} />
                     <input className="input h-8 text-xs" placeholder="Номер документа" value={guestDocNumber} onChange={e => setGuestDocNumber(e.target.value)} />
                     <input type="date" className="input h-8 text-xs" value={guestDocExpiration} onChange={e => setGuestDocExpiration(e.target.value)} />
                  </div>

                  <div className="flex justify-end">
                     <button className="btn-primary h-8 px-3 flex items-center gap-1 text-[11px]" onClick={addGuestPassenger} disabled={!guestFullName.trim()}>
                        <Plus size={12} />
                        Добавить гостя
                     </button>
                  </div>
               </div>
            </div>

            {/* Список пассажиров */}
            <div className="border-t border-slate-100 pt-3 mt-1 space-y-2 text-xs">
               <div className="font-semibold text-[11px] mb-1">{passengersCount === 0 ? 'Пассажиров нет' : 'Список пассажиров'}</div>

               {passengers.map(p => {
                  if (p.kind === 'EMPLOYEE') {
                     const emp = getEmployeeById(p.employeeId)
                     const hasDocs = employeeHasValidDocs(p.employeeId)
                     return (
                        <div key={p.id} className="flex items-start justify-between px-2 py-2 rounded border border-slate-200 bg-slate-50">
                           <div className="flex items-start gap-2">
                              <User size={14} className="mt-0.5 text-slate-500" />
                              <div>
                                 <div className="font-medium text-[13px]">{emp?.name}</div>
                                 <div className="text-[11px] text-slate-500">
                                    {emp?.email} • {emp?.department || 'Без отдела'}
                                 </div>
                                 <div className="mt-1 text-[11px]">
                                    <span
                                       className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                                          hasDocs ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                       }`}
                                    >
                                       {hasDocs ? 'Документы OK' : 'Документы отсутствуют / просрочены'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <button className="btn-ghost h-7 px-2 text-[11px] text-slate-500 flex items-center gap-1" onClick={() => removePassenger(p.id)}>
                              <Trash2 size={12} />
                              Удалить
                           </button>
                        </div>
                     )
                  }

                  return (
                     <div key={p.id} className="flex items-start justify-between px-2 py-2 rounded border border-slate-200 bg-white">
                        <div className="flex items-start gap-2">
                           <User size={14} className="mt-0.5 text-slate-500" />
                           <div>
                              <div className="font-medium text-[13px]">{p.fullName}</div>
                              <div className="text-[11px] text-slate-500">Гость • {p.relation}</div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                 Документ: {p.docNumber || '—'}
                                 {p.docExpiration && ` • истекает: ${p.docExpiration}`}
                              </div>
                           </div>
                        </div>

                        <button className="btn-ghost h-7 px-2 text-[11px] text-slate-500 flex items-center gap-1" onClick={() => removePassenger(p.id)}>
                           <Trash2 size={12} />
                           Удалить
                        </button>
                     </div>
                  )
               })}
            </div>
         </div>

         {/* 3. Оплата и итог */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            {/* Оплата */}
            <div className="md:col-span-2 space-y-3">
               <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Способ оплаты</span>
               </div>

               <div className="space-y-2 text-xs">
                  {allowedPaymentMethods.map(m => (
                     <label key={m} className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input type="radio" className="mt-1" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                        <div>
                           <div className="font-semibold text-[11px]">{paymentLabel(m)}</div>
                           <div className="text-[11px] text-slate-600">
                              {m === 'COMPANY_BALANCE' && 'Оплата с баланса компании. Документы будут доступны.'}
                              {m === 'CORP_CARD' && 'Оплата корпоративной картой. Документы будут доступны.'}
                              {m === 'POSTPAY' && 'Отложенный платёж. Компания должна оплатить счёт позже.'}
                              {m === 'PERSONAL_CARD' && 'Личная карта — закрывающие документы недоступны.'}
                           </div>
                        </div>
                     </label>
                  ))}
               </div>
            </div>

            {/* Итог + AI помощник */}
            <div className="border-l border-slate-100 pl-0 md:pl-4 md:ml-4 text-xs flex flex-col justify-between">
               <div className="space-y-3">
                  <div className="space-y-2">
                     <div className="font-semibold text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-slate-600" />
                        Итог заказа
                     </div>

                     <div className="flex items-center justify-between">
                        <span>Пассажиров</span>
                        <span className="font-medium">{passengersCount || 1}</span>
                     </div>

                     <div className="flex items-center justify-between">
                        <span>Цена за 1 пассажира</span>
                        <span>{selectedFlight.price.toLocaleString('ru-RU')} ₸</span>
                     </div>

                     <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                        <span className="font-semibold">Итого</span>
                        <span className="font-semibold">{totalAmount.toLocaleString('ru-RU')} ₸</span>
                     </div>

                     <div className="mt-2 text-[11px] text-slate-500">
                        Закрывающие документы: <strong>{closingDocsAvailable ? 'будут сформированы' : 'недоступны'}</strong>.
                     </div>

                     {flightPolicy === 'BLOCK' && (
                        <div className="mt-2 text-[11px] text-red-600 flex items-start gap-1">
                           <AlertTriangle size={12} className="mt-[2px]" />
                           Этот рейс заблокирован политикой — покупка невозможна.
                        </div>
                     )}
                  </div>

                  {/* AI помощник */}
                  <div
                     className={`
                       mt-3 p-3 rounded-lg border text-[11px] space-y-2
                       ${hasProblems ? 'border-amber-300 bg-amber-50/70' : 'border-emerald-200 bg-emerald-50/70'}
                     `}
                  >
                     <div className="flex items-center gap-2 text-slate-800">
                        <Sparkles size={14} className={hasProblems ? 'text-amber-600' : 'text-emerald-600'} />
                        <span className="font-semibold">AI-подсказки</span>
                     </div>

                     {aiHints.map((hint, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-slate-800">
                           <span className="mt-[2px] select-none">•</span>
                           <span>{hint}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Кнопки */}
               <div className="mt-4 flex flex-col gap-2">
                  <button className="btn-primary w-full flex items-center justify-center gap-2 text-xs disabled:opacity-60" disabled={!canPurchase} onClick={handlePurchase}>
                     {purchaseStatus === 'PROCESSING' ? (
                        <>
                           <Loader2 size={14} className="animate-spin" />
                           Оформление…
                        </>
                     ) : (
                        'Подтвердить покупку'
                     )}
                  </button>

                  {purchaseStatus === 'DONE' && (
                     <div className="mt-2 p-2 rounded border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-[2px]" />
                        <div>
                           <div className="font-semibold">Заказ оформлен</div>
                           <div className="mt-1">Билеты и документы сформированы (в прототипе — заглушка).</div>
                           <div className="mt-2 flex flex-wrap gap-2">
                              <button className="btn-ghost h-7 px-2 text-[11px] flex items-center gap-1" onClick={handleDownloadTickets}>
                                 <FileText size={12} />
                                 Скачать билеты
                              </button>
                              <button className="btn-ghost h-7 px-2 text-[11px] flex items-center gap-1" onClick={handleDownloadAllDocs}>
                                 <FileText size={12} />
                                 Все документы
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
