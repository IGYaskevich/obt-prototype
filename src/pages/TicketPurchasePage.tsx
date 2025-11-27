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
   const { company, selectedFlight, employees, getEmployeeById, employeeHasValidDocs, travelPolicy, addTrip } = useStore()

   if (!company) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Checkout" subtitle="Company context is missing. Please log in again." />
            <div className="card p-4 text-sm text-red-600">Company is not available in current session.</div>
         </div>
      )
   }

   if (!selectedFlight) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Checkout" subtitle="You need to select a flight before purchasing." />
            <div className="card p-4 text-sm flex items-center justify-between">
               <span>No flight selected.</span>
               <button className="btn-primary flex items-center gap-1 text-xs" onClick={() => nav('/search')}>
                  <ArrowLeft size={14} />
                  Back to search
               </button>
            </div>
         </div>
      )
   }

   // -------- HELPERS --------

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

   const flightPolicyLabel = flightPolicy === 'OK' ? 'Within company policy' : flightPolicy === 'WARN' ? 'Allowed with warning' : 'Blocked by policy'

   const flightPolicyBadgeClass =
      flightPolicy === 'OK'
         ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
         : flightPolicy === 'WARN'
           ? 'bg-amber-50 text-amber-700 border border-amber-200'
           : 'bg-red-50 text-red-700 border-red-200'

   // -------- PASSENGERS --------

   const defaultEmployee =
      employees.find(e => e.email === company?.tariff && false) || // просто заглушка, по сути всегда false
      employees[0]

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

   const [employeeToAdd, setEmployeeToAdd] = useState<string>(defaultEmployee ? defaultEmployee.id : employees[0]?.id || '')

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
            relation: guestRelation.trim() || 'Family',
            docNumber: guestDocNumber.trim(),
            docExpiration: guestDocExpiration.trim(),
         },
      ])
      setGuestFullName('')
      setGuestRelation('')
      setGuestDocNumber('')
      setGuestDocExpiration('')
   }

   const removePassenger = (id: string) => {
      setPassengers(prev => prev.filter(p => p.id !== id))
   }

   const passengersCount = passengers.length

   const firstEmployeePassenger = passengers.find(p => p.kind === 'EMPLOYEE') as PassengerEmployee | undefined

   // -------- PAYMENT METHOD --------

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

   const paymentLabel = (m: PaymentMethod): string => {
      switch (m) {
         case 'COMPANY_BALANCE':
            return 'Company balance'
         case 'CORP_CARD':
            return 'Corporate card'
         case 'POSTPAY':
            return 'Postpay (invoice)'
         case 'PERSONAL_CARD':
            return 'Personal card'
      }
   }

   const closingDocsAvailable = paymentMethod === 'PERSONAL_CARD' ? false : true

   // -------- PURCHASE SIMULATION --------

   const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('IDLE')

   const totalAmount = useMemo(() => selectedFlight.price * Math.max(passengersCount, 1), [selectedFlight.price, passengersCount])

   const canPurchase = passengersCount > 0 && flightPolicy !== 'BLOCK' && purchaseStatus !== 'PROCESSING'

   const handlePurchase = () => {
      if (!canPurchase) return

      setPurchaseStatus('PROCESSING')

      // имитация async-операции
      setTimeout(() => {
         // создаём Trip в store
         addTrip({
            title: `${selectedFlight.from} → ${selectedFlight.to} • ${passengersCount} pax`,
            total: totalAmount,
            // @ts-ignore
            type: 'single',
            status: 'COMPLETED',
            employeeId: firstEmployeePassenger?.employeeId,
         })

         setPurchaseStatus('DONE')
      }, 1200)
   }

   const handleDownloadTickets = () => {
      alert('Simulated: download tickets PDF for all passengers.')
   }

   const handleDownloadAllDocs = () => {
      if (!closingDocsAvailable) {
         alert('Closing documents are not available for personal card payments.')
         return
      }
      alert('Simulated: download all documents (tickets + invoice + act) as ZIP/PDF package.')
   }

   // -------- INLINE AI-ASSISTANT LOGIC --------

   const hasDocsIssues = passengers.some(p => p.kind === 'EMPLOYEE' && !employeeHasValidDocs((p as PassengerEmployee).employeeId))

   const aiHints: string[] = []

   if (passengersCount === 0) {
      aiHints.push('Вы ещё не добавили ни одного пассажира. Начните с сотрудника или гостя.')
   } else {
      aiHints.push(`Пассажиров в заказе: ${passengersCount}.`)
   }

   if (hasDocsIssues) {
      aiHints.push('У одного или нескольких сотрудников нет валидных документов (паспорт/ID). Добавьте или обновите документы, чтобы избежать проблем при вылете.')
   }

   if (flightPolicy === 'WARN') {
      aiHints.push('Этот рейс выходит за мягкие ограничения travel-политики (WARN). В реальном продукте может потребоваться согласование или выбор более дешёвого варианта.')
   }

   if (flightPolicy === 'BLOCK') {
      aiHints.push('Рейс заблокирован travel-политикой (BLOCK). В этом прототипе покупка недоступна — попробуйте выбрать другой рейс.')
   }

   if (paymentMethod === 'PERSONAL_CARD') {
      aiHints.push(
         'Вы выбрали оплату личной картой. В этом режиме закрывающие документы обычно недоступны — используйте баланс компании или корпоративную карту для full B2B-комплаенса.',
      )
   } else {
      aiHints.push('Выбран корпоративный способ оплаты. Закрывающие документы будут сформированы и доступны на странице «Документы».')
   }

   if (company.tariff === 'POSTPAY') {
      aiHints.push(`Тариф Postpay: покупка уйдёт в отложенный платёж, счёт нужно будет оплатить в течение ${company.postpayDueDays} дней.`)
   }

   if (company.tariff === 'FLEX') {
      aiHints.push('Тариф Flex: в реальном продукте вы могли бы бесплатно менять билеты и расширять условия возврата.')
   }

   const hasProblems = hasDocsIssues || flightPolicy !== 'OK'

   // -------- RENDER --------

   return (
      <div className="space-y-6">
         <SectionHeader title="Checkout" subtitle="Select passengers, payment method and confirm purchase." />

         <button className="text-xs text-slate-500 flex items-center gap-1 mb-2" onClick={() => nav(-1)}>
            <ArrowLeft size={14} />
            Back
         </button>

         {/* 1. FLIGHT SUMMARY + POLICY */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
               <div className="text-xs text-slate-500">Selected flight</div>
               <div className="font-semibold">
                  {selectedFlight.from} → {selectedFlight.to}
               </div>
               <div className="text-xs text-slate-600">
                  {selectedFlight.date} • {selectedFlight.depart} – {selectedFlight.arrive}
               </div>
               <div className="text-xs text-slate-600">Carrier: {selectedFlight.carrier}</div>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
               <div className="font-semibold text-[11px]">Price & policy</div>
               <div>
                  Base price: <span className="font-medium">{selectedFlight.price.toLocaleString('ru-RU')} KZT</span>
               </div>
               <div>
                  Total for {Math.max(passengersCount, 1)} pax: <span className="font-medium">{totalAmount.toLocaleString('ru-RU')} KZT</span>
               </div>
               <div className="mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${flightPolicyBadgeClass}`}>{flightPolicy}</span>
                  <span className="text-[11px] text-slate-600">{flightPolicyLabel}</span>
               </div>
            </div>
            <div className="text-xs text-slate-500 flex items-start gap-2">
               <AlertTriangle size={14} className="mt-[2px] text-slate-400" />
               <span>Policy thresholds are configured by admin in Company Settings. If flight is BLOCK, you cannot complete purchase in this prototype.</span>
            </div>
         </div>

         {/* 2. PASSENGERS BLOCK */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Passengers</span>
               </div>
               <div className="text-xs text-slate-500">Multi-passenger booking for employees and their family members.</div>
            </div>

            {/* 2.1 Add employee passenger */}
            <div className="grid md:grid-cols-2 gap-4 text-xs">
               <div className="space-y-2">
                  <div className="font-semibold text-[11px]">Add employee</div>
                  <div className="flex gap-2">
                     <select className="select h-8 text-xs flex-1" value={employeeToAdd} onChange={e => setEmployeeToAdd(e.target.value)}>
                        {employees.map(e => (
                           <option key={e.id} value={e.id}>
                              {e.name} ({e.email})
                           </option>
                        ))}
                     </select>
                     <button className="btn-primary h-8 px-3 flex items-center gap-1 text-[11px]" type="button" onClick={addEmployeePassenger} disabled={!employeeToAdd}>
                        <Plus size={12} />
                        Add
                     </button>
                  </div>
                  <div className="text-[11px] text-slate-500">Employee documents are taken from employee profile (passports/ID).</div>
               </div>

               {/* 2.2 Add guest passenger */}
               <div className="space-y-2">
                  <div className="font-semibold text-[11px]">Add guest (family / non-employee)</div>
                  <div className="grid grid-cols-2 gap-2">
                     <input className="input h-8 text-xs" placeholder="Full name" value={guestFullName} onChange={e => setGuestFullName(e.target.value)} />
                     <input className="input h-8 text-xs" placeholder="Relation (e.g. Spouse, Child)" value={guestRelation} onChange={e => setGuestRelation(e.target.value)} />
                     <input className="input h-8 text-xs" placeholder="Document number" value={guestDocNumber} onChange={e => setGuestDocNumber(e.target.value)} />
                     <input type="date" className="input h-8 text-xs" placeholder="Expiration" value={guestDocExpiration} onChange={e => setGuestDocExpiration(e.target.value)} />
                  </div>
                  <div className="flex justify-end">
                     <button className="btn-primary h-8 px-3 flex items-center gap-1 text-[11px]" type="button" onClick={addGuestPassenger} disabled={!guestFullName.trim()}>
                        <Plus size={12} />
                        Add guest
                     </button>
                  </div>
               </div>
            </div>

            {/* 2.3 List of passengers */}
            <div className="border-t border-slate-100 pt-3 mt-1 space-y-2 text-xs">
               <div className="font-semibold text-[11px] mb-1">{passengersCount === 0 ? 'No passengers added yet' : 'Passengers list'}</div>
               {passengersCount > 0 && (
                  <div className="space-y-2">
                     {passengers.map(p => {
                        if (p.kind === 'EMPLOYEE') {
                           const emp = getEmployeeById(p.employeeId)
                           const hasDocs = employeeHasValidDocs(p.employeeId)
                           return (
                              <div key={p.id} className="flex items-start justify-between px-2 py-2 rounded border border-slate-200 bg-slate-50">
                                 <div className="flex items-start gap-2">
                                    <User size={14} className="mt-0.5 text-slate-500" />
                                    <div>
                                       <div className="font-medium text-[13px]">{emp?.name || 'Unknown employee'}</div>
                                       <div className="text-[11px] text-slate-500">
                                          {emp?.email} • {emp?.department || 'No department'}
                                       </div>
                                       <div className="flex items-center gap-2 mt-1 text-[11px]">
                                          <span
                                             className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                                                hasDocs ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                             }`}
                                          >
                                             {hasDocs ? 'Docs OK' : 'Docs missing/expired'}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                                 <button className="btn-ghost h-7 px-2 text-[11px] text-slate-500 flex items-center gap-1" onClick={() => removePassenger(p.id)}>
                                    <Trash2 size={12} />
                                    Remove
                                 </button>
                              </div>
                           )
                        } else {
                           return (
                              <div key={p.id} className="flex items-start justify-between px-2 py-2 rounded border border-slate-200 bg-white">
                                 <div className="flex items-start gap-2">
                                    <User size={14} className="mt-0.5 text-slate-500" />
                                    <div>
                                       <div className="font-medium text-[13px]">{p.fullName}</div>
                                       <div className="text-[11px] text-slate-500">Guest • {p.relation || 'Family/Other'}</div>
                                       <div className="text-[11px] text-slate-500 mt-1">
                                          Doc: {p.docNumber || '—'}
                                          {p.docExpiration && ` • exp: ${p.docExpiration}`}
                                       </div>
                                    </div>
                                 </div>
                                 <button className="btn-ghost h-7 px-2 text-[11px] text-slate-500 flex items-center gap-1" onClick={() => removePassenger(p.id)}>
                                    <Trash2 size={12} />
                                    Remove
                                 </button>
                              </div>
                           )
                        }
                     })}
                  </div>
               )}
            </div>
         </div>

         {/* 3. PAYMENT & SUMMARY + INLINE AI ASSISTANT */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            {/* 3.1 Payment methods */}
            <div className="md:col-span-2 space-y-3">
               <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Payment method</span>
               </div>
               <div className="space-y-2 text-xs">
                  {allowedPaymentMethods.map(m => (
                     <label key={m} className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <input type="radio" className="mt-1" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                        <div>
                           <div className="font-semibold text-[11px]">{paymentLabel(m)}</div>
                           <div className="text-[11px] text-slate-600">
                              {m === 'COMPANY_BALANCE' && 'Pay from pre-loaded company balance; closing docs available.'}
                              {m === 'CORP_CARD' && 'Pay with saved corporate card token; closing docs available.'}
                              {m === 'POSTPAY' && 'Invoice will be issued and paid later within postpay due period.'}
                              {m === 'PERSONAL_CARD' && 'Employee pays with personal card; closing docs usually not available.'}
                           </div>
                        </div>
                     </label>
                  ))}
               </div>
            </div>

            {/* 3.2 Summary & actions + AI assistant */}
            <div className="border-l border-slate-100 pl-0 md:pl-4 md:ml-4 text-xs flex flex-col justify-between">
               <div className="space-y-3">
                  <div className="space-y-2">
                     <div className="font-semibold text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-slate-600" />
                        Order summary
                     </div>
                     <div className="flex items-center justify-between">
                        <span>Passengers</span>
                        <span className="font-medium">{passengersCount || 1}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span>Base price</span>
                        <span>{selectedFlight.price.toLocaleString('ru-RU')} KZT</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span>Tariff</span>
                        <span className="badge-soft text-[10px] uppercase">{company.tariff}</span>
                     </div>
                     <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">{totalAmount.toLocaleString('ru-RU')} KZT</span>
                     </div>
                     <div className="mt-2 text-[11px] text-slate-500">
                        Closing documents: <strong>{closingDocsAvailable ? 'will be generated' : 'not available'}</strong> ({paymentLabel(paymentMethod)}).
                     </div>
                     {flightPolicy === 'BLOCK' && (
                        <div className="mt-2 text-[11px] text-red-600 flex items-start gap-1">
                           <AlertTriangle size={12} className="mt-[2px]" />
                           <span>This flight is blocked by travel policy. In this prototype purchase is disabled for BLOCK options.</span>
                        </div>
                     )}
                  </div>

                  {/* INLINE AI ASSISTANT BLOCK */}
                  <div
                     className={`
                mt-3 p-3 rounded-lg border text-[11px] space-y-2
                ${hasProblems ? 'border-amber-300 bg-amber-50/70' : 'border-emerald-200 bg-emerald-50/70'}
              `}
                  >
                     <div className="flex items-center gap-2 text-slate-800">
                        <Sparkles size={14} className={hasProblems ? 'text-amber-600' : 'text-emerald-600'} />
                        <span className="font-semibold">AI-помощник при оформлении</span>
                     </div>
                     <div className="space-y-1">
                        {aiHints.map((hint, idx) => (
                           <div key={idx} className="flex items-start gap-1 text-slate-800">
                              <span className="mt-[2px] select-none">•</span>
                              <span>{hint}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="mt-4 flex flex-col gap-2">
                  <button className="btn-primary w-full flex items-center justify-center gap-2 text-xs disabled:opacity-60" disabled={!canPurchase} onClick={handlePurchase}>
                     {purchaseStatus === 'PROCESSING' ? (
                        <>
                           <Loader2 size={14} className="animate-spin" />
                           Issuing tickets…
                        </>
                     ) : (
                        'Confirm purchase'
                     )}
                  </button>
                  {purchaseStatus === 'DONE' && (
                     <div className="mt-2 p-2 rounded border border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 flex items-start gap-2">
                        <CheckCircle2 size={14} className="mt-[2px]" />
                        <div>
                           <div className="font-semibold">Order completed</div>
                           <div className="mt-1">Tickets are issued in this prototype. You can now simulate document download.</div>
                           <div className="mt-2 flex flex-wrap gap-2">
                              <button className="btn-ghost h-7 px-2 text-[11px] flex items-center gap-1" onClick={handleDownloadTickets}>
                                 <FileText size={12} />
                                 Download tickets
                              </button>
                              <button className="btn-ghost h-7 px-2 text-[11px] flex items-center gap-1" onClick={handleDownloadAllDocs}>
                                 <FileText size={12} />
                                 Download all documents
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
