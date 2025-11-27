import React, { createContext, useContext, useMemo, useState } from 'react'

/* ========== TYPES ========== */

export type Tariff = 'FREE' | 'POSTPAY' | 'FLEX'
export type PolicyLevel = 'OK' | 'WARN' | 'BLOCK'

export type Role = 'ADMIN' | 'BOOKER' | 'VIEWER'
export type Permission = 'BUY' | 'BUILD_TRIP' | 'EXCHANGE' | 'VIEW_DOCS' | 'VIEW_ONLY'

export type User = {
    email: string
    companyName: string
    role: Role
}

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

export type BookingStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NEEDS_APPROVAL' | 'CANCELLED'
export type BookingType = 'single' | 'basket'

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

/** Corporate cards, привязанные к сотруднику */
export type EmployeeCard = {
    id: string
    provider: string        // Kaspi, Halyk, Visa Corporate...
    label: string           // "Corporate travel card" и т.п.
    last4: string           // последние 4 цифры
    expiration: string      // YYYY-MM
}

export type Employee = {
    id: string
    name: string
    email: string
    role: Role
    department?: string
    documents: EmployeeDocument[]
    cards: EmployeeCard[]
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
    addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void

    employees: Employee[]
    addEmployee: (e: Omit<Employee, 'id' | 'documents' | 'cards'>) => void
    updateEmployeeRole: (id: string, role: Role) => void
    removeEmployee: (id: string) => void

    /** Документы сотрудника */
    addEmployeeDocument: (employeeId: string, doc: Omit<EmployeeDocument, 'status'>) => void
    removeEmployeeDocument: (employeeId: string, docNumber: string) => void

    /** Корпоративные карты сотрудника */
    addEmployeeCard: (employeeId: string, card: Omit<EmployeeCard, 'id'>) => void
    removeEmployeeCard: (employeeId: string, cardId: string) => void

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

    const [trips, setTrips] = useState<Trip[]>([])

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
            cards: [
                {
                    id: 'C1',
                    provider: 'Kaspi',
                    label: 'Corporate travel card',
                    last4: '1234',
                    expiration: '2027-08',
                },
            ],
        },
        {
            id: 'E2',
            name: 'Mariya Booker',
            email: 'booker@company.com',
            role: 'BOOKER',
            department: 'Operations',
            documents: [
                { type: 'PASSPORT', number: 'K7654321', expirationDate: '2024-01-01', status: 'EXPIRED' },
            ],
            cards: [],
        },
        {
            id: 'E3',
            name: 'Alex Viewer',
            email: 'viewer@company.com',
            role: 'VIEWER',
            department: 'Sales',
            documents: [],
            cards: [],
        },
    ])

    /* ----- Trips ----- */

    const addTrip = (trip: Omit<Trip, 'id' | 'createdAt'>) =>
        setTrips(prev => [
            {
                ...trip,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ])

    /* ----- Auth / company ----- */

    const login = (email: string, tariff: Tariff) => {
        const role: Role =
            email.includes('admin') ? 'ADMIN'
                : email.includes('booker') ? 'BOOKER'
                    : 'VIEWER'

        setUser({ email, companyName: 'Demo Company LLC', role })
        setCompany({
            balance: 320000,
            postpayLimit: 1500000,
            postpayDueDays: 14,
            tariff,
        })
    }

    const logout = () => {
        setUser(null)
        setCompany(null)
        setSelectedFlight(null)
    }

    const setTariff = (t: Tariff) =>
        setCompany(c => (c ? { ...c, tariff: t } : c))

    /* ----- Flights ----- */

    const selectFlight = (id: string) =>
        setSelectedFlight(seedFlights.find(f => f.id === id) || null)

    /* ----- Employees ----- */

    const addEmployee = (e: Omit<Employee, 'id' | 'documents' | 'cards'>) =>
        setEmployees(prev => [
            {
                ...e,
                id: crypto.randomUUID(),
                documents: [],
                cards: [],
            },
            ...prev,
        ])

    const updateEmployeeRole = (id: string, role: Role) =>
        setEmployees(prev => prev.map(emp => (emp.id === id ? { ...emp, role } : emp)))

    const removeEmployee = (id: string) =>
        setEmployees(prev => prev.filter(emp => emp.id !== id))

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
                    : emp
            )
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
                    : emp
            )
        )
    }

    const addEmployeeCard = (employeeId: string, card: Omit<EmployeeCard, 'id'>) => {
        setEmployees(prev =>
            prev.map(emp =>
                emp.id === employeeId
                    ? {
                        ...emp,
                        cards: [
                            ...emp.cards,
                            {
                                ...card,
                                id: crypto.randomUUID(),
                            },
                        ],
                    }
                    : emp
            )
        )
    }

    const removeEmployeeCard = (employeeId: string, cardId: string) => {
        setEmployees(prev =>
            prev.map(emp =>
                emp.id === employeeId
                    ? {
                        ...emp,
                        cards: emp.cards.filter(c => c.id !== cardId),
                    }
                    : emp
            )
        )
    }

    /* ----- Permissions / helpers ----- */

    const hasPermission = (p: Permission) => {
        if (!user) return false
        const r = user.role
        if (r === 'ADMIN') return true
        if (r === 'BOOKER') return p !== 'EXCHANGE'
        if (r === 'VIEWER') return p === 'VIEW_DOCS' || p === 'VIEW_ONLY'
        return false
    }

    const getEmployeeById = (id: string) => employees.find(e => e.id === id)

    // Нужно хотя бы 1 VALID паспорт или ID.
    const employeeHasValidDocs = (id: string) => {
        const e = getEmployeeById(id)
        if (!e) return false
        return e.documents.some(
            d =>
                (d.type === 'PASSPORT' || d.type === 'ID_CARD') &&
                computeDocumentStatus(d.expirationDate) === 'VALID'
        )
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

            addEmployeeCard,
            removeEmployeeCard,

            hasPermission,

            getEmployeeById,
            employeeHasValidDocs,
        }),
        [user, company, selectedFlight, trips, employees]
    )

    return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

/* ========== HOOK ========== */

export function useStore() {
    const ctx = useContext(StoreCtx)
    if (!ctx) throw new Error('StoreProvider missing')
    return ctx
}