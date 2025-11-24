import React, { createContext, useContext, useMemo, useState } from 'react'

export type Tariff = 'FREE' | 'POSTPAY' | 'FLEX'
export type PolicyLevel = 'OK' | 'WARN' | 'BLOCK'

export type User = { email: string; companyName: string }
export type Company = {
  balance: number
  postpayLimit: number
  postpayDueDays: number
  tariff: Tariff
}

export type Flight = {
  id: string
  from: string
  to: string
  date: string
  depart: string
  arrive: string
  carrier: string
  price: number
  policy: PolicyLevel
  refundable: boolean
  changeable: boolean
}

type Store = {
  user: User | null
  company: Company | null
  setTariff: (t: Tariff) => void
  login: (email: string, t: Tariff) => void
  logout: () => void
  flights: Flight[]
  selectedFlight: Flight | null
  selectFlight: (id: string) => void
  trips: any[]
  addTrip: (trip: any) => void
}

const StoreCtx = createContext<Store | null>(null)

const seedFlights: Flight[] = [
  { id:'F1', from:'Almaty', to:'Astana', date:'2025-12-02', depart:'07:20', arrive:'09:05', carrier:'Air Astana', price: 42000, policy:'OK', refundable:false, changeable:false },
  { id:'F2', from:'Almaty', to:'Astana', date:'2025-12-02', depart:'10:40', arrive:'12:25', carrier:'SCAT', price: 51000, policy:'WARN', refundable:true, changeable:true },
  { id:'F3', from:'Almaty', to:'Astana', date:'2025-12-02', depart:'18:10', arrive:'19:55', carrier:'FlyArystan', price: 36000, policy:'BLOCK', refundable:false, changeable:false },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [trips, setTrips] = useState<any[]>([])

  const login = (email: string, tariff: Tariff) => {
    setUser({ email, companyName: 'Demo Company LLC' })
    setCompany({
      balance: 320000,
      postpayLimit: 1500000,
      postpayDueDays: 14,
      tariff,
    })
  }

  const logout = () => { setUser(null); setCompany(null); setSelectedFlight(null) }

  const setTariff = (t: Tariff) => setCompany(c => c ? ({ ...c, tariff: t }) : c)

  const selectFlight = (id: string) => setSelectedFlight(seedFlights.find(f => f.id === id) || null)

  const addTrip = (trip: any) => setTrips(prev => [trip, ...prev])

  const value = useMemo<Store>(() => ({
    user, company, setTariff, login, logout,
    flights: seedFlights,
    selectedFlight, selectFlight,
    trips, addTrip,
  }), [user, company, selectedFlight, trips])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('StoreProvider missing')
  return ctx
}
