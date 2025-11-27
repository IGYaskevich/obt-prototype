import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { Plane, TrainFront, BedDouble, Car, PlaneTakeoff } from 'lucide-react'

type SearchTab = 'AVIA' | 'RAIL' | 'HOTEL' | 'TRANSFER'
type TripType = 'ONE_WAY' | 'ROUND_TRIP'
type CabinClass = 'ECONOMY' | 'BUSINESS'

function formatDate(d: Date): string {
   return d.toISOString().slice(0, 10)
}

export default function SearchPage() {
   const [tab, setTab] = useState<SearchTab>('AVIA')

   return (
      <div className="space-y-6">
         <SectionHeader title="Search trips" subtitle="Search flights, rail, hotels and transfers with company policies and tariff applied" />

         {/* Tabs */}
         <div className="card p-2 flex items-center justify-between gap-4">
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
               <TabButton label="Avia" icon={Plane} active={tab === 'AVIA'} onClick={() => setTab('AVIA')} />
               <TabButton label="Rail" icon={TrainFront} active={tab === 'RAIL'} onClick={() => setTab('RAIL')} />
               <TabButton label="Hotel" icon={BedDouble} active={tab === 'HOTEL'} onClick={() => setTab('HOTEL')} />
            </div>
            <div className="text-[11px] text-slate-500">This is a demo search screen — results are mocked for all types.</div>
         </div>

         {/* Content per tab */}
         {tab === 'AVIA' && <AviaSearchForm />}
         {tab === 'RAIL' && <RailSearchForm />}
         {tab === 'HOTEL' && <HotelSearchForm />}
         {tab === 'TRANSFER' && <TransferSearchForm />}
      </div>
   )
}

/* ================== AVIA ================== */

function AviaSearchForm() {
   const nav = useNavigate()
   const { company, employees } = useStore()

   const today = new Date()
   const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
   const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

   const [tripType, setTripType] = useState<TripType>('ONE_WAY')
   const [from, setFrom] = useState('Almaty')
   const [to, setTo] = useState('Astana')
   const [departDate, setDepartDate] = useState(formatDate(today))
   const [returnDate, setReturnDate] = useState<string>('')

   const [passengers, setPassengers] = useState<number>(1)
   const [cabinClass, setCabinClass] = useState<CabinClass>('ECONOMY')

   const [travelerId, setTravelerId] = useState<string>('')
   const [reason, setReason] = useState<string>('')

   const [dateError, setDateError] = useState<string>('')

   useEffect(() => {
      if (!travelerId && employees.length > 0) {
         setTravelerId(employees[0].id)
      }
   }, [employees, travelerId])

   useEffect(() => {
      if (tripType === 'ROUND_TRIP' && returnDate && departDate && returnDate < departDate) {
         setDateError('Return date cannot be earlier than depart date.')
      } else {
         setDateError('')
      }
   }, [tripType, departDate, returnDate])

   const handleSwap = () => {
      setFrom(prev => {
         const newFrom = to
         setTo(prev)
         return newFrom
      })
   }

   const applyQuickDate = (preset: 'today' | 'tomorrow' | 'nextWeek') => {
      let base: Date
      switch (preset) {
         case 'tomorrow':
            base = tomorrow
            break
         case 'nextWeek':
            base = nextWeek
            break
         default:
            base = today
      }
      const baseStr = formatDate(base)
      setDepartDate(baseStr)

      if (tripType === 'ROUND_TRIP') {
         const back = new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000)
         setReturnDate(formatDate(back))
      }
   }

   const handleSearch = () => {
      if (!from.trim() || !to.trim() || !departDate) {
         alert('Please fill From, To and Depart date.')
         return
      }
      if (tripType === 'ROUND_TRIP' && (!returnDate || returnDate < departDate)) {
         alert('Please set a valid return date.')
         return
      }
      if (!travelerId) {
         alert('Please select traveler.')
         return
      }

      const params = new URLSearchParams()
      params.set('mode', 'avia')
      params.set('tripType', tripType)
      params.set('from', from)
      params.set('to', to)
      params.set('departDate', departDate)
      if (tripType === 'ROUND_TRIP' && returnDate) {
         params.set('returnDate', returnDate)
      }
      params.set('pax', String(passengers))
      params.set('cabin', cabinClass)
      params.set('travelerId', travelerId)
      if (reason.trim()) params.set('reason', reason.trim())

      nav(`/search/results?${params.toString()}`)
   }

   const tariffLabel = getTariffLabel(company?.tariff)
   const policyHint = getPolicyHint(company?.tariff, cabinClass)

   return (
      <div className="card p-4 space-y-4">
         {/* Trip type */}
         <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500">Trip type (Avia)</div>
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
               <button
                  type="button"
                  className={'px-3 py-1 rounded-full transition ' + (tripType === 'ONE_WAY' ? 'bg-white shadow text-slate-900' : 'text-slate-600')}
                  onClick={() => setTripType('ONE_WAY')}
               >
                  One-way
               </button>
               <button
                  type="button"
                  className={'px-3 py-1 rounded-full transition ' + (tripType === 'ROUND_TRIP' ? 'bg-white shadow text-slate-900' : 'text-slate-600')}
                  onClick={() => {
                     setTripType('ROUND_TRIP')
                     if (!returnDate || returnDate < departDate) {
                        const back = new Date(new Date(departDate).getTime() + 3 * 24 * 60 * 60 * 1000)
                        setReturnDate(formatDate(back))
                     }
                  }}
               >
                  Round-trip
               </button>
            </div>
         </div>

         {/* From / To */}
         <div className="grid md:grid-cols-[1.2fr_1.2fr_auto] gap-3 items-end">
            <div>
               <label className="text-xs text-slate-500">From</label>
               <input className="input mt-1" value={from} onChange={e => setFrom(e.target.value)} placeholder="City or airport" />
            </div>
            <div>
               <label className="text-xs text-slate-500">To</label>
               <input className="input mt-1" value={to} onChange={e => setTo(e.target.value)} placeholder="City or airport" />
            </div>
            <button type="button" className="btn-ghost h-9 mt-5 flex items-center justify-center" onClick={handleSwap}>
               <Plane size={16} />
            </button>
         </div>

         {/* Dates */}
         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">Depart date</label>
               <input type="date" className="input mt-1" value={departDate} onChange={e => setDepartDate(e.target.value)} />
            </div>

            {tripType === 'ROUND_TRIP' && (
               <div>
                  <label className="text-xs text-slate-500">Return date</label>
                  <input type="date" className="input mt-1" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
               </div>
            )}

            <div className="flex flex-col gap-1">
               <span className="text-xs text-slate-500">Quick dates</span>
               <div className="flex gap-2">
                  <button type="button" className="btn-ghost flex-1 text-xs" onClick={() => applyQuickDate('today')}>
                     Today
                  </button>
                  <button type="button" className="btn-ghost flex-1 text-xs" onClick={() => applyQuickDate('tomorrow')}>
                     Tomorrow
                  </button>
                  <button type="button" className="btn-ghost flex-1 text-xs" onClick={() => applyQuickDate('nextWeek')}>
                     Next week
                  </button>
               </div>
            </div>
         </div>

         {dateError && <div className="text-xs text-red-600">{dateError}</div>}

         {/* Passengers / Cabin / Traveler */}
         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">Passengers</label>
               <input
                  type="number"
                  min={1}
                  max={9}
                  className="input mt-1"
                  value={passengers}
                  onChange={e => setPassengers(Math.max(1, Math.min(9, Number(e.target.value) || 1)))}
               />
            </div>

            <div>
               <label className="text-xs text-slate-500">Cabin class</label>
               <select className="select mt-1" value={cabinClass} onChange={e => setCabinClass(e.target.value as CabinClass)}>
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
               </select>
            </div>

            <div>
               <label className="text-xs text-slate-500">Traveler</label>
               <select className="select mt-1" value={travelerId} onChange={e => setTravelerId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                     <option key={e.id} value={e.id}>
                        {e.name} ({e.department ?? 'No dept'})
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Reason + Tariff */}
         <div className="grid md:grid-cols-2 gap-3">
            <div>
               <label className="text-xs text-slate-500">Reason (optional)</label>
               <input className="input mt-1" value={reason} onChange={e => setReason(e.target.value)} placeholder="Client meeting, internal workshop, conference…" />
            </div>

            <TariffBadgeRight />
         </div>

         {/* Policy hint + Search */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-slate-100 mt-2">
            <PolicyHint policyHint={policyHint} />
            <button type="button" className="btn-primary self-end" onClick={handleSearch}>
               Search flights
            </button>
         </div>
      </div>
   )
}

/* ================== RAIL ================== */

function RailSearchForm() {
   const nav = useNavigate()
   const { company, employees } = useStore()

   const today = new Date()

   const [from, setFrom] = useState('Almaty')
   const [to, setTo] = useState('Astana')
   const [date, setDate] = useState(formatDate(today))
   const [travelerId, setTravelerId] = useState<string>('')
   const [pax, setPax] = useState(1)

   useEffect(() => {
      if (!travelerId && employees.length > 0) {
         setTravelerId(employees[0].id)
      }
   }, [employees, travelerId])

   const handleSwap = () => {
      setFrom(prev => {
         const newFrom = to
         setTo(prev)
         return newFrom
      })
   }

   const handleSearch = () => {
      if (!from.trim() || !to.trim() || !date) {
         alert('Please fill From, To and date.')
         return
      }
      if (!travelerId) {
         alert('Please select traveler.')
         return
      }

      const params = new URLSearchParams()
      params.set('mode', 'rail')
      params.set('from', from)
      params.set('to', to)
      params.set('date', date)
      params.set('pax', String(pax))
      params.set('travelerId', travelerId)

      nav(`/search/results?${params.toString()}`)
   }

   const tariffLabel = getTariffLabel(company?.tariff)

   return (
      <div className="card p-4 space-y-4">
         <div className="text-xs text-slate-500">Rail search (simplified)</div>

         <div className="grid md:grid-cols-[1.2fr_1.2fr_auto] gap-3 items-end">
            <div>
               <label className="text-xs text-slate-500">From</label>
               <input className="input mt-1" value={from} onChange={e => setFrom(e.target.value)} placeholder="City or station" />
            </div>
            <div>
               <label className="text-xs text-slate-500">To</label>
               <input className="input mt-1" value={to} onChange={e => setTo(e.target.value)} placeholder="City or station" />
            </div>
            <button type="button" className="btn-ghost h-9 mt-5 flex items-center justify-center" onClick={handleSwap}>
               <Plane size={16} />
            </button>
         </div>

         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">Date</label>
               <input type="date" className="input mt-1" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Passengers</label>
               <input type="number" min={1} max={9} className="input mt-1" value={pax} onChange={e => setPax(Math.max(1, Math.min(9, Number(e.target.value) || 1)))} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Traveler</label>
               <select className="select mt-1" value={travelerId} onChange={e => setTravelerId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                     <option key={e.id} value={e.id}>
                        {e.name} ({e.department ?? 'No dept'})
                     </option>
                  ))}
               </select>
            </div>
         </div>

         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-slate-100 mt-2">
            <div className="text-[11px] text-slate-500">{tariffLabel || 'Rail trips follow the same company policy and tariff as flights (limits and approvals).'}</div>
            <button type="button" className="btn-primary self-end" onClick={handleSearch}>
               Search rail tickets
            </button>
         </div>
      </div>
   )
}

/* ================== HOTEL ================== */

function HotelSearchForm() {
   const nav = useNavigate()
   const { company, employees } = useStore()
   const today = new Date()
   const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

   const [city, setCity] = useState('Astana')
   const [checkIn, setCheckIn] = useState(formatDate(today))
   const [checkOut, setCheckOut] = useState(formatDate(tomorrow))
   const [guests, setGuests] = useState(1)
   const [rooms, setRooms] = useState(1)
   const [travelerId, setTravelerId] = useState<string>('')

   const [dateError, setDateError] = useState('')

   useEffect(() => {
      if (!travelerId && employees.length > 0) {
         setTravelerId(employees[0].id)
      }
   }, [employees, travelerId])

   useEffect(() => {
      if (checkOut && checkIn && checkOut < checkIn) {
         setDateError('Check-out cannot be earlier than check-in.')
      } else {
         setDateError('')
      }
   }, [checkIn, checkOut])

   const handleSearch = () => {
      if (!city.trim() || !checkIn || !checkOut) {
         alert('Please fill city and dates.')
         return
      }
      if (checkOut < checkIn) {
         alert('Please set a valid period.')
         return
      }
      if (!travelerId) {
         alert('Please select traveler.')
         return
      }

      const params = new URLSearchParams()
      params.set('mode', 'hotel')
      params.set('city', city)
      params.set('checkIn', checkIn)
      params.set('checkOut', checkOut)
      params.set('guests', String(guests))
      params.set('rooms', String(rooms))
      params.set('travelerId', travelerId)

      nav(`/search/results?${params.toString()}`)
   }

   const tariffLabel = getTariffLabel(company?.tariff)

   return (
      <div className="card p-4 space-y-4">
         <div className="text-xs text-slate-500">Hotel search</div>

         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">City</label>
               <input className="input mt-1" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Check-in</label>
               <input type="date" className="input mt-1" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Check-out</label>
               <input type="date" className="input mt-1" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
            </div>
         </div>

         {dateError && <div className="text-xs text-red-600">{dateError}</div>}

         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">Guests</label>
               <input type="number" min={1} max={10} className="input mt-1" value={guests} onChange={e => setGuests(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Rooms</label>
               <input type="number" min={1} max={5} className="input mt-1" value={rooms} onChange={e => setRooms(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Traveler</label>
               <select className="select mt-1" value={travelerId} onChange={e => setTravelerId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                     <option key={e.id} value={e.id}>
                        {e.name} ({e.department ?? 'No dept'})
                     </option>
                  ))}
               </select>
            </div>
         </div>

         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-slate-100 mt-2">
            <div className="text-[11px] text-slate-500">{tariffLabel || 'Hotel limits (nightly price, stars) are applied according to your company policy.'}</div>
            <button type="button" className="btn-primary self-end" onClick={handleSearch}>
               Search hotels
            </button>
         </div>
      </div>
   )
}

/* ================== TRANSFER ================== */

function TransferSearchForm() {
   const nav = useNavigate()
   const { company, employees } = useStore()
   const today = new Date()

   const [from, setFrom] = useState('Almaty airport')
   const [to, setTo] = useState('City center')
   const [date, setDate] = useState(formatDate(today))
   const [time, setTime] = useState('10:00')
   const [pax, setPax] = useState(1)
   const [travelerId, setTravelerId] = useState<string>('')

   useEffect(() => {
      if (!travelerId && employees.length > 0) {
         setTravelerId(employees[0].id)
      }
   }, [employees, travelerId])

   const handleSwap = () => {
      setFrom(prev => {
         const newFrom = to
         setTo(prev)
         return newFrom
      })
   }

   const handleSearch = () => {
      if (!from.trim() || !to.trim() || !date || !time) {
         alert('Please fill From, To, date and time.')
         return
      }
      if (!travelerId) {
         alert('Please select traveler.')
         return
      }

      const params = new URLSearchParams()
      params.set('mode', 'transfer')
      params.set('from', from)
      params.set('to', to)
      params.set('date', date)
      params.set('time', time)
      params.set('pax', String(pax))
      params.set('travelerId', travelerId)

      nav(`/search/results?${params.toString()}`)
   }

   const tariffLabel = getTariffLabel(company?.tariff)

   return (
      <div className="card p-4 space-y-4">
         <div className="text-xs text-slate-500">Transfer search</div>

         <div className="grid md:grid-cols-[1.2fr_1.2fr_auto] gap-3 items-end">
            <div>
               <label className="text-xs text-slate-500">From</label>
               <input className="input mt-1" value={from} onChange={e => setFrom(e.target.value)} placeholder="Airport, station, address" />
            </div>
            <div>
               <label className="text-xs text-slate-500">To</label>
               <input className="input mt-1" value={to} onChange={e => setTo(e.target.value)} placeholder="Hotel, office, address" />
            </div>
            <button type="button" className="btn-ghost h-9 mt-5 flex items-center justify-center" onClick={handleSwap}>
               <Plane size={16} />
            </button>
         </div>

         <div className="grid md:grid-cols-3 gap-3">
            <div>
               <label className="text-xs text-slate-500">Date</label>
               <input type="date" className="input mt-1" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Time</label>
               <input type="time" className="input mt-1" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
               <label className="text-xs text-slate-500">Passengers</label>
               <input type="number" min={1} max={6} className="input mt-1" value={pax} onChange={e => setPax(Math.max(1, Math.min(6, Number(e.target.value) || 1)))} />
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-3">
            <div>
               <label className="text-xs text-slate-500">Traveler</label>
               <select className="select mt-1" value={travelerId} onChange={e => setTravelerId(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                     <option key={e.id} value={e.id}>
                        {e.name} ({e.department ?? 'No dept'})
                     </option>
                  ))}
               </select>
            </div>
            <div className="text-[11px] text-slate-500 flex items-end">
               {tariffLabel || 'Transfer bookings can be grouped with flights and hotels into a single business trip.'}
            </div>
         </div>

         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-slate-100 mt-2">
            <div className="text-[11px] text-slate-500">Pickup times and vehicle types will be shown on the next screen with mocked options.</div>
            <button type="button" className="btn-primary self-end" onClick={handleSearch}>
               Search transfers
            </button>
         </div>
      </div>
   )
}

/* ================== SHARED MINI UI ================== */

function TabButton({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
   return (
      <button
         type="button"
         className={'flex items-center gap-1 px-3 py-1 rounded-full transition ' + (active ? 'bg-white shadow text-slate-900' : 'text-slate-600')}
         onClick={onClick}
      >
         <Icon size={12} />
         <span>{label}</span>
      </button>
   )
}

function TariffBadgeRight() {
   const { company } = useStore()
   const tariffLabel = getTariffLabel(company?.tariff)

   return (
      <div className="flex flex-col justify-between text-xs text-slate-600 md:items-end">
         <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-1 justify-end">
               <span>Company tariff:</span>
               <span className="badge-brand uppercase tracking-wide">{company?.tariff ?? 'FREE'}</span>
            </div>
            {tariffLabel && <div className="text-[11px] text-right text-slate-500 mt-1">{tariffLabel}</div>}
         </div>
      </div>
   )
}

function PolicyHint({ policyHint }: { policyHint: string }) {
   return (
      <div className="text-xs text-slate-500 flex items-start gap-2">
         <PlaneTakeoff size={14} className="mt-0.5" />
         <div>
            <div className="font-medium text-slate-700">Policy & approval hint</div>
            <div>{policyHint}</div>
         </div>
      </div>
   )
}

/* ================== HELPERS ================== */

function getTariffLabel(tariff?: string): string {
   if (!tariff) return ''
   if (tariff === 'FREE') {
      return 'Free: simple flow, mostly personal card payments. Company balance may be limited.'
   }
   if (tariff === 'POSTPAY') {
      return 'Postpay: tickets go to company postpay balance with payment due in a fixed number of days.'
   }
   if (tariff === 'FLEX') {
      return 'Flex: priority support, simplified exchanges and extended integration options.'
   }
   return ''
}

function getPolicyHint(tariff: string | undefined, cabin: CabinClass): string {
   if (!tariff) {
      return 'Standard policy applies: economy class preferred, out-of-policy options may require approval.'
   }

   if (tariff === 'FREE') {
      if (cabin === 'BUSINESS') {
         return 'Business class is likely out of policy for Free tier and may be blocked or require special approval.'
      }
      return 'Free tier usually enforces economy class and minimal steps to purchase, mostly with personal cards.'
   }

   if (tariff === 'POSTPAY') {
      if (cabin === 'BUSINESS') {
         return 'Business class may be allowed with manager approval. This purchase will go to postpay balance.'
      }
      return 'Economy class tickets will go to company postpay balance; finance team will see them on Dashboard and Reports.'
   }

   if (tariff === 'FLEX') {
      if (cabin === 'BUSINESS') {
         return 'Business class is usually allowed for Flex with extended exchange and refund options.'
      }
      return 'Flex allows more flexibility on changes and cancellations; policy is still applied but with softer limits.'
   }

   return 'Standard company policy applies for this search.'
}
