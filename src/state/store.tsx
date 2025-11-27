import React, { createContext, useContext, useMemo, useState } from 'react'

/* ========== TYPES ========== */

export type Tariff = 'FREE' | 'POSTPAY' | 'FLEX'
export type PolicyLevel = 'OK' | 'WARN' | 'BLOCK'

/**
 * Роли:
 * - ADMIN: настройки, тарифы, политики, сотрудники, всё управление.
 * - COORDINATOR: только операционная работа (поиск, бронирование, отчёты).
 */
export type Role = 'ADMIN' | 'COORDINATOR'

/**
 * Права:
 * - MANAGE_* — админские функции
 * - BUY / BUILD_TRIP — операционная работа
 * - VIEW_* — просмотровые вещи
 */
export type Permission = 'MANAGE_SETTINGS' | 'MANAGE_POLICIES' | 'MANAGE_TARIFFS' | 'MANAGE_EMPLOYEES' | 'BUY' | 'BUILD_TRIP' | 'VIEW_DOCS' | 'VIEW_REPORTS'

export type TravelPolicy = {
   softLimit: number
   blockLimit: number
   preferredFrom: string // "HH:MM"
   preferredTo: string // "HH:MM"
   allowedClasses: string[] // ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS']
   allowConnections: boolean
   maxConnectionTime: number // minutes
   handBaggageOnly: boolean
}

export type User = {
   email: string
   companyName: string
   role: Role
}

/** Привязанная корпоративная карта компании */
export type CorporateCard = {
   brand: string // Visa Business, MasterCard Corporate и т.п.
   last4: string // последние 4 цифры
   holder: string // имя/название на карте
   expiry: string // YYYY-MM
   status: 'ACTIVE' | 'BLOCKED'
}

export type Company = {
   balance: number
   postpayLimit: number
   postpayDueDays: number
   tariff: Tariff
   corporateCard?: CorporateCard
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

/**
 * Статусы бронирования:
 * - COMPLETED: выкуплено / завершено
 * - IN_PROGRESS: пользователь в процессе
 * - FLAGGED: выбивается из политики (без "аппрува")
 * - CANCELLED: отменено
 */
export type BookingStatus = 'COMPLETED' | 'IN_PROGRESS' | 'FLAGGED' | 'CANCELLED'

/**
 * Тип бронирования:
 * Оставляем только 'single' как одиночную бронь.
 */
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

/** Employee documents */
export type EmployeeDocumentType = 'PASSPORT' | 'ID_CARD' | 'VISA'
export type EmployeeDocumentStatus = 'VALID' | 'EXPIRED' | 'MISSING'

export type EmployeeDocument = {
   type: EmployeeDocumentType
   number: string
   expirationDate: string // ISO YYYY-MM-DD
   status: EmployeeDocumentStatus
}

/** Сотрудник: только настройки + документы */
export type Employee = {
   id: string
   name: string
   email: string
   role: Role
   department?: string
   documents: EmployeeDocument[]
}

/* ========== STORE SHAPE ========== */

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
   addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'type'>) => void

   travelPolicy: TravelPolicy
   updateTravelPolicy: (patch: Partial<TravelPolicy>) => void

   employees: Employee[]
   addEmployee: (e: Omit<Employee, 'id' | 'documents'>) => void
   updateEmployeeRole: (id: string, role: Role) => void
   removeEmployee: (id: string) => void

   /** Документы сотрудника */
   addEmployeeDocument: (employeeId: string, doc: Omit<EmployeeDocument, 'status'>) => void
   removeEmployeeDocument: (employeeId: string, docNumber: string) => void

   /** Корпоративная карта компании */
   updateCorporateCard: (card: CorporateCard | null) => void

   hasPermission: (p: Permission) => boolean

   /** Helpers */
   getEmployeeById: (id: string) => Employee | undefined
   employeeHasValidDocs: (id: string) => boolean
}

/* ========== INTERNALS ========== */

const StoreCtx = createContext<Store | null>(null)

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

function computeDocumentStatus(expirationDate: string): EmployeeDocumentStatus {
   if (!expirationDate) return 'MISSING'
   const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
   return expirationDate < today ? 'EXPIRED' : 'VALID'
}

/* ========== PROVIDER ========== */

export function StoreProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null)
   const [company, setCompany] = useState<Company | null>(null)
   const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

   const [trips, setTrips] = useState<Trip[]>([
      {
         id: 'T1',
         title: 'Almaty → Astana (Ignat Admin)',
         total: 42000,
         type: 'single',
         status: 'COMPLETED',
         createdAt: '2025-11-20T10:00:00Z',
         employeeId: 'E1',
      },
      {
         id: 'T2',
         title: 'Almaty → Astana (Mariya Coordinator)',
         total: 51000,
         type: 'single',
         status: 'FLAGGED',
         createdAt: '2025-11-22T07:30:00Z',
         employeeId: 'E2',
      },
   ])

   const [employees, setEmployees] = useState<Employee[]>([
      {
         id: 'E1',
         name: 'Ignat Admin',
         email: 'admin@company.com',
         role: 'ADMIN',
         department: 'Finance',
         documents: [
            { type: 'PASSPORT', number: 'N1234567', expirationDate: '2028-05-10', status: 'VALID' },
            { type: 'ID_CARD', number: 'ID998877', expirationDate: '2030-01-01', status: 'VALID' },
         ],
      },
      {
         id: 'E2',
         name: 'Mariya Coordinator',
         email: 'coordinator@company.com',
         role: 'COORDINATOR',
         department: 'Operations',
         documents: [{ type: 'PASSPORT', number: 'K7654321', expirationDate: '2026-11-01', status: 'VALID' }],
      },
   ])

   /* ----- Trips ----- */

   const addTrip = (trip: Omit<Trip, 'id' | 'createdAt' | 'type'>) =>
      setTrips(prev => [
         {
            ...trip,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            type: 'single',
         },
         ...prev,
      ])

   /* ----- Auth / company ----- */

   const login = (email: string, tariff: Tariff) => {
      const role: Role = email.includes('admin') ? 'ADMIN' : 'COORDINATOR'

      setUser({ email, companyName: 'Demo Company LLC', role })
      setCompany({
         balance: 320000,
         postpayLimit: 1500000,
         postpayDueDays: 14,
         tariff,
         corporateCard: undefined, // в реальном продукте появится после первичной регистрации
      })
   }

   const logout = () => {
      setUser(null)
      setCompany(null)
      setSelectedFlight(null)
   }

   const setTariff = (t: Tariff) => setCompany(c => (c ? { ...c, tariff: t } : c))

   /* ----- Flights ----- */

   const selectFlight = (id: string) => setSelectedFlight(seedFlights.find(f => f.id === id) || null)

   /* ----- Employees ----- */

   const addEmployee = (e: Omit<Employee, 'id' | 'documents'>) =>
      setEmployees(prev => [
         {
            ...e,
            id: crypto.randomUUID(),
            documents: [],
         },
         ...prev,
      ])

   const updateEmployeeRole = (id: string, role: Role) => setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, role } : emp)))

   const removeEmployee = (id: string) => setEmployees(prev => prev.filter(emp => emp.id !== id))

   const addEmployeeDocument = (employeeId: string, doc: Omit<EmployeeDocument, 'status'>) => {
      setEmployees(prev =>
         prev.map(emp =>
            emp.id === employeeId
               ? {
                    ...emp,
                    documents: [
                       ...emp.documents,
                       {
                          ...doc,
                          status: computeDocumentStatus(doc.expirationDate),
                       },
                    ],
                 }
               : emp,
         ),
      )
   }

   const removeEmployeeDocument = (employeeId: string, docNumber: string) => {
      setEmployees(prev =>
         prev.map(emp =>
            emp.id === employeeId
               ? {
                    ...emp,
                    documents: emp.documents.filter(d => d.number !== docNumber),
                 }
               : emp,
         ),
      )
   }

   /* ----- Corporate card (company-level) ----- */

   const updateCorporateCard = (card: CorporateCard | null) => {
      setCompany(c =>
         c
            ? {
                 ...c,
                 corporateCard: card ?? undefined,
              }
            : c,
      )
   }

   /* ----- Permissions / helpers ----- */

   const hasPermission = (p: Permission) => {
      if (!user) return false
      const r = user.role

      if (r === 'ADMIN') {
         return true
      }

      if (r === 'COORDINATOR') {
         if (p === 'BUY' || p === 'BUILD_TRIP' || p === 'VIEW_DOCS' || p === 'VIEW_REPORTS') {
            return true
         }
         return false
      }

      return false
   }

   const getEmployeeById = (id: string) => employees.find(e => e.id === id)

   // Нужно хотя бы 1 VALID паспорт или ID.
   const employeeHasValidDocs = (id: string) => {
      const e = getEmployeeById(id)
      if (!e) return false
      return e.documents.some(d => (d.type === 'PASSPORT' || d.type === 'ID_CARD') && computeDocumentStatus(d.expirationDate) === 'VALID')
   }

   const [travelPolicy, setTravelPolicy] = useState<TravelPolicy>({
      softLimit: 80000,
      blockLimit: 120000,
      preferredFrom: '07:00',
      preferredTo: '21:00',
      allowedClasses: ['ECONOMY'],
      allowConnections: true,
      maxConnectionTime: 180,
      handBaggageOnly: false,
   })

   const updateTravelPolicy = (patch: Partial<TravelPolicy>) => {
      setTravelPolicy(prev => ({ ...prev, ...patch }))
   }
   /* ----- Memoized value ----- */

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

         addEmployeeDocument,
         removeEmployeeDocument,

         updateCorporateCard,

         hasPermission,

         getEmployeeById,
         employeeHasValidDocs,

         travelPolicy,
         updateTravelPolicy,
      }),
      [user, company, selectedFlight, trips, employees],
   )

   return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

/* ========== HOOK ========== */

export function useStore() {
   const ctx = useContext(StoreCtx)
   if (!ctx) throw new Error('StoreProvider missing')
   return ctx
}
