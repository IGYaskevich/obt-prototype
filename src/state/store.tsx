import React, { createContext, useContext, useMemo, useState } from 'react'

/* === Базовые типы === */

export type Tariff = 'FREE' | 'POSTPAY' | 'FLEX'
export type PolicyLevel = 'OK' | 'WARN' | 'BLOCK'

export type Role = 'ADMIN' | 'COORDINATOR'
export type Permission = 'BUY' | 'BUILD_TRIP' | 'EXCHANGE' | 'VIEW_DOCS' | 'VIEW_ONLY' | 'MANAGE_SETTINGS' | 'MANAGE_TARIFFS'

export type User = { email: string; companyName: string; role: Role }

/* === Корпоративная карта компании === */

export type CorporateCardStatus = 'ACTIVE' | 'BLOCKED'

export type CorporateCard = {
   brand: string // Продукт/бренд карты, например "Visa Business"
   last4: string // Последние 4 цифры
   holder: string // Владелец карты
   expiry: string // Срок действия, например "2027-08"
   status: CorporateCardStatus
}

/* === Компания === */

export type Company = {
   balance: number
   postpayLimit: number
   postpayDueDays: number
   tariff: Tariff
   corporateCard?: CorporateCard | null
}

/* === Поиск/перелёты === */

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

export type BookingStatus = 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED'
export type BookingType = 'single'

export type Trip = {
   id: string
   title: string
   total: number
   type: BookingType
   status: BookingStatus
   createdAt: string
   employeeId?: string
}

/* === Документы сотрудника === */

export type EmployeeDocumentType = 'PASSPORT' | 'ID_CARD' | 'VISA'
export type EmployeeDocumentStatus = 'VALID' | 'EXPIRED' | 'MISSING'

export type EmployeeDocument = {
   type: EmployeeDocumentType
   number: string
   expirationDate: string // ISO date
   status: EmployeeDocumentStatus
}

export type Employee = {
   id: string
   name: string
   email: string
   role: Role
   department?: string
   documents: EmployeeDocument[]
}

/* === Тревел-политика компании === */

export type TravelPolicyConfig = {
   softLimit: number // с какой суммы начинаем WARN
   blockLimit: number // с какой суммы BLOCK
   preferredFrom: string // рекомендованное время вылета от (HH:mm)
   preferredTo: string // рекомендованное время вылета до (HH:mm)
   allowedClasses: string[] // разрешённые классы (ECONOMY, BUSINESS и т.п.)
   allowConnections: boolean // разрешены стыковки
   maxConnectionTime: number // макс. время стыковки в минутах
   handBaggageOnly: boolean // только ручная кладь
}

/* === Штрафы === */

export type PenaltyType = 'POLICY_VIOLATION' | 'NO_SHOW' | 'PAID_CANCELLATION' | 'LATE_BOOKING' | 'OUT_OF_POLICY_TIME'

export type PenaltyStatus = 'UNPAID' | 'PAID'

export type Penalty = {
   id: string
   employeeId: string
   employeeName: string
   type: PenaltyType
   amount: number
   currency: string
   date: string // ISO date (YYYY-MM-DD)
   status: PenaltyStatus
   reason?: string
}

/* === Командировки (Business Trip) === */

export type ServiceKind = 'FLIGHT' | 'RAIL' | 'HOTEL' | 'OTHER'

export type BusinessTripService = {
   id: string
   kind: ServiceKind
   title: string
   from?: string
   to?: string
   startDateTime: string // ISO
   endDateTime: string // ISO
   supplier: string
   amount: number
   currency: string
}

export type BusinessTripStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type BusinessTrip = {
   id: string
   name: string
   ownerEmployeeId: string
   status: BusinessTripStatus
   startDate: string // YYYY-MM-DD
   endDate: string // YYYY-MM-DD
   services: BusinessTripService[]
}

/* === Store === */

type Store = {
   user: User | null
   company: Company | null
   setTariff: (t: Tariff) => void
   login: (email: string, t: Tariff) => void
   logout: () => void

   flights: Flight[]
   selectedFlight: Flight | null
   selectFlight: (id: string) => void

   trips: Trip[]
   addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void

   employees: Employee[]
   addEmployee: (e: Omit<Employee, 'id'>) => void
   updateEmployeeRole: (id: string, role: Role) => void
   removeEmployee: (id: string) => void
   hasPermission: (p: Permission) => boolean

   /** Документы сотрудников */
   getEmployeeById: (id: string) => Employee | undefined
   employeeHasValidDocs: (id: string) => boolean

   /** Тревел-политика */
   travelPolicy: TravelPolicyConfig
   updateTravelPolicy: (cfg: Partial<TravelPolicyConfig>) => void

   /** Штрафы */
   penalties: Penalty[]
   addPolicyViolationPenalty: (args: { employeeId: string; amount: number; reason?: string }) => void

   /** Командировки */
   businessTrips: BusinessTrip[]
   getBusinessTripById: (id: string) => BusinessTrip | undefined

   /** Корпоративная карта */
   updateCorporateCard: (card: CorporateCard | null) => void
}

const StoreCtx = createContext<Store | null>(null)

/* === Моки перелётов === */

const seedFlights: Flight[] = [
   {
      id: 'F1',
      from: 'Almaty',
      to: 'Astana',
      date: '2025-12-02',
      depart: '07:20',
      arrive: '09:05',
      carrier: 'Air Astana',
      price: 42000,
      policy: 'OK',
      refundable: false,
      changeable: false,
   },
   {
      id: 'F2',
      from: 'Almaty',
      to: 'Astana',
      date: '2025-12-02',
      depart: '10:40',
      arrive: '12:25',
      carrier: 'SCAT',
      price: 51000,
      policy: 'WARN',
      refundable: true,
      changeable: true,
   },
   {
      id: 'F3',
      from: 'Almaty',
      to: 'Astana',
      date: '2025-12-02',
      depart: '18:10',
      arrive: '19:55',
      carrier: 'FlyArystan',
      price: 36000,
      policy: 'BLOCK',
      refundable: false,
      changeable: false,
   },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null)
   const [company, setCompany] = useState<Company | null>(null)
   const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

   const [trips, setTrips] = useState<Trip[]>([])

   const [employees, setEmployees] = useState<Employee[]>([
      {
         id: 'E1',
         name: 'Ignat Admin',
         email: 'admin@company.com',
         role: 'ADMIN',
         department: 'Finance',
         documents: [
            {
               type: 'PASSPORT',
               number: 'N1234567',
               expirationDate: '2028-05-10',
               status: 'VALID',
            },
            {
               type: 'ID_CARD',
               number: 'ID998877',
               expirationDate: '2030-01-01',
               status: 'VALID',
            },
         ],
      },
      {
         id: 'E2',
         name: 'Mariya Coordinator',
         email: 'booker@company.com',
         role: 'COORDINATOR',
         department: 'Operations',
         documents: [
            {
               type: 'PASSPORT',
               number: 'K7654321',
               expirationDate: '2024-01-01',
               status: 'EXPIRED',
            },
         ],
      },
      {
         id: 'E3',
         name: 'Daniyar Manager',
         email: 'manager@company.com',
         role: 'COORDINATOR',
         department: 'Sales',
         documents: [],
      },
   ])

   /** Тревел-политика по умолчанию */
   const [travelPolicy, setTravelPolicy] = useState<TravelPolicyConfig>({
      softLimit: 60000,
      blockLimit: 120000,
      preferredFrom: '07:00',
      preferredTo: '22:00',
      allowedClasses: ['ECONOMY'],
      allowConnections: true,
      maxConnectionTime: 180,
      handBaggageOnly: false,
   })

   /** Штрафы */
   const [penalties, setPenalties] = useState<Penalty[]>([])

   /** Командировки (мок) */
   const [businessTrips] = useState<BusinessTrip[]>([
      {
         id: 'BT1',
         name: 'Командировка: Алматы → Астана (встреча с клиентом)',
         ownerEmployeeId: 'E1',
         status: 'COMPLETED',
         startDate: '2025-11-10',
         endDate: '2025-11-12',
         services: [
            {
               id: 'S1',
               kind: 'FLIGHT',
               title: 'Алматы → Астана (авиа)',
               from: 'Almaty',
               to: 'Astana',
               startDateTime: '2025-11-10T09:00:00.000Z',
               endDateTime: '2025-11-10T11:00:00.000Z',
               supplier: 'Air Astana',
               amount: 42000,
               currency: 'KZT',
            },
            {
               id: 'S2',
               kind: 'HOTEL',
               title: 'Отель в Астане (2 ночи)',
               startDateTime: '2025-11-10T14:00:00.000Z',
               endDateTime: '2025-11-12T10:00:00.000Z',
               supplier: 'Hotel Astana Center',
               amount: 68000,
               currency: 'KZT',
            },
         ],
      },
      {
         id: 'BT2',
         name: 'Командировка: Алматы → Стамбул (международная)',
         ownerEmployeeId: 'E2',
         status: 'IN_PROGRESS',
         startDate: '2025-10-25',
         endDate: '2025-10-30',
         services: [
            {
               id: 'S3',
               kind: 'FLIGHT',
               title: 'Алматы → Стамбул (авиа)',
               from: 'Almaty',
               to: 'Istanbul',
               startDateTime: '2025-10-25T10:00:00.000Z',
               endDateTime: '2025-10-25T15:00:00.000Z',
               supplier: 'Turkish Airlines',
               amount: 250000,
               currency: 'KZT',
            },
         ],
      },
   ])

   /* === Trips === */

   const addTrip = (trip: Omit<Trip, 'id' | 'createdAt'>) =>
      setTrips(prev => [
         {
            ...trip,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
         },
         ...prev,
      ])

   /* === Auth / компания === */

   const login = (email: string, tariff: Tariff) => {
      const role: Role = email.includes('admin') ? 'ADMIN' : 'COORDINATOR'

      setUser({ email, companyName: 'Demo Company LLC', role })
      setCompany({
         balance: 320000,
         postpayLimit: 1500000,
         postpayDueDays: 14,
         tariff,
         corporateCard: null,
      })
   }

   const logout = () => {
      setUser(null)
      setCompany(null)
      setSelectedFlight(null)
   }

   const setTariff = (t: Tariff) => setCompany(c => (c ? { ...c, tariff: t } : c))

   /* === Перелёты === */

   const selectFlight = (id: string) => setSelectedFlight(seedFlights.find(f => f.id === id) || null)

   /* === Сотрудники === */

   const addEmployee = (e: Omit<Employee, 'id'>) => setEmployees(prev => [{ ...e, id: crypto.randomUUID(), documents: e.documents ?? [] }, ...prev])

   const updateEmployeeRole = (id: string, role: Role) => setEmployees(prev => prev.map(e => (e.id === id ? { ...e, role } : e)))

   const removeEmployee = (id: string) => setEmployees(prev => prev.filter(e => e.id !== id))

   const hasPermission = (p: Permission) => {
      if (!user) return false
      const r = user.role

      if (r === 'ADMIN') {
         // админ может всё
         return true
      }

      if (r === 'COORDINATOR') {
         // координатор: покупка и работа с системой, но без настроек
         if (p === 'VIEW_ONLY') return true
         if (p === 'VIEW_DOCS') return true
         if (p === 'BUY') return true
         if (p === 'BUILD_TRIP') return true
         if (p === 'EXCHANGE') return false
         if (p === 'MANAGE_SETTINGS') return false
         if (p === 'MANAGE_TARIFFS') return false
         return false
      }

      return false
   }

   const getEmployeeById = (id: string) => employees.find(e => e.id === id)

   // Простое правило: нужен хотя бы 1 VALID паспорт или ID.
   const employeeHasValidDocs = (id: string) => {
      const e = getEmployeeById(id)
      if (!e) return false
      return e.documents.some(d => d.status === 'VALID' && (d.type === 'PASSPORT' || d.type === 'ID_CARD'))
   }

   /* === Тревел-политика === */

   const updateTravelPolicy = (cfg: Partial<TravelPolicyConfig>) => {
      setTravelPolicy(prev => ({ ...prev, ...cfg }))
   }

   /* === Штрафы === */

   const addPolicyViolationPenalty = (args: { employeeId: string; amount: number; reason?: string }) => {
      const { employeeId, amount, reason } = args
      const emp = getEmployeeById(employeeId)
      const employeeName = emp?.name ?? 'Unknown employee'

      const today = new Date()
      const iso = today.toISOString().slice(0, 10) // YYYY-MM-DD

      setPenalties(prev => [
         ...prev,
         {
            id: crypto.randomUUID(),
            employeeId,
            employeeName,
            type: 'POLICY_VIOLATION',
            amount,
            currency: 'KZT',
            date: iso,
            status: 'UNPAID',
            reason,
         },
      ])
   }

   /* === Командировки === */

   const getBusinessTripById = (id: string) => businessTrips.find(bt => bt.id === id)

   /* === Корпоративная карта === */

   const updateCorporateCard = (card: CorporateCard | null) => {
      setCompany(prev =>
         prev
            ? {
                 ...prev,
                 corporateCard: card,
              }
            : prev,
      )
   }

   /* === value === */

   const value = useMemo<Store>(
      () => ({
         user,
         company,
         setTariff,
         login,
         logout,

         flights: seedFlights,
         selectedFlight,
         selectFlight,

         trips,
         addTrip,

         employees,
         addEmployee,
         updateEmployeeRole,
         removeEmployee,
         hasPermission,

         getEmployeeById,
         employeeHasValidDocs,

         travelPolicy,
         updateTravelPolicy,

         penalties,
         addPolicyViolationPenalty,

         businessTrips,
         getBusinessTripById,

         updateCorporateCard,
      }),
      [user, company, selectedFlight, trips, employees, travelPolicy, penalties, businessTrips],
   )

   return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
   const ctx = useContext(StoreCtx)
   if (!ctx) throw new Error('StoreProvider missing')
   return ctx
}
