import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore, Trip } from '../state/store'
import {
    Wallet,
    CreditCard,
    ShieldCheck,
    AlertTriangle,
    Plane,
    ShoppingCart,
    FileText,
    LifeBuoy,
    Users,
    Clock,
    TrendingUp,
    ArrowRight,
} from 'lucide-react'

export default function DashboardPage() {
    const nav = useNavigate()
    const { company, trips, employees, hasPermission } = useStore()

    // Локальные мок-трипы для демо, если из стора пока пусто
    const [demoTrips] = useState<Trip[]>([
        {
            id: 'T1',
            title: 'Almaty → Astana (business trip)',
            total: 120000,
            type: 'single',
            status: 'COMPLETED',
            createdAt: '2025-11-10T09:00:00.000Z',
            employeeId: 'E1',
        },
        {
            id: 'T2',
            title: 'Almaty → Astana + hotel',
            total: 210000,
            type: 'basket',
            status: 'IN_PROGRESS',
            createdAt: '2025-11-12T11:00:00.000Z',
            employeeId: 'E2',
        },
        {
            id: 'T4',
            title: 'Astana → Almaty (return)',
            total: 115000,
            type: 'single',
            status: 'CANCELLED',
            createdAt: '2025-11-18T08:15:00.000Z',
            employeeId: 'E1',
        },
        {
            id: 'T5',
            title: 'Almaty → Istanbul (Flex)',
            total: 380000,
            type: 'basket',
            status: 'COMPLETED',
            createdAt: '2025-10-25T10:00:00.000Z',
            employeeId: 'E2',
        },
    ])

    // Источник данных для дашборда: реальные из стора или моки
    const sourceTrips = trips.length > 0 ? trips : demoTrips

    if (!company) return null

    const canBuy = hasPermission('BUY')
    const canBuildTrip = hasPermission('BUILD_TRIP')

    const analytics = useMemo(() => {
        const byStatus = (list: Trip[]) => ({
            COMPLETED: list.filter(t => t.status === 'COMPLETED').length,
            IN_PROGRESS: list.filter(t => t.status === 'IN_PROGRESS').length,
            CANCELLED: list.filter(t => t.status === 'CANCELLED').length,
        })

        const total = sourceTrips.length
        const flights = sourceTrips.filter(t => t.type === 'single')
        const baskets = sourceTrips.filter(t => t.type === 'basket')

        const allStatus = byStatus(sourceTrips)
        const flightsStatus = byStatus(flights)
        const basketsStatus = byStatus(baskets)

        // Простейшая помесячная агрегация по createdAt
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
            basketsStatus,
            monthlyItems,
        }
    }, [sourceTrips])

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
                    name: emp?.name ?? 'Unknown',
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
        const relevant = sourceTrips.filter(
            t => t.status === 'IN_PROGRESS' || t.status === 'COMPLETED'
        )
        const withParsed = relevant
            .map(t => ({ ...t, date: new Date(t.createdAt) }))
            .filter(t => !Number.isNaN(t.date.getTime()))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
        return withParsed.slice(0, 5)
    }, [sourceTrips])

    const compliance = useMemo(() => {
        const cancelled = sourceTrips.filter(t => t.status === 'CANCELLED').length
        const inProgress = sourceTrips.filter(t => t.status === 'IN_PROGRESS').length

        return {
            cancelled,
            inProgress,
        }
    }, [sourceTrips])

    // Inbox / задачи для пользователя
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
            title: 'Employee document issues',
            description: `${employeeActivity.docIssues.length} employee(s) with missing or expired documents.`,
            severity: 'medium',
            ctaLabel: 'Fix documents',
            onClick: () => nav('/employees'),
        })
    }

    if ((company.tariff === 'POSTPAY' || company.tariff === 'FLEX') && company.postpayDueDays <= 7) {
        inboxTasks.push({
            id: 'postpay',
            title: 'Upcoming postpay payment',
            description: `Postpay payment due in ${company.postpayDueDays} day(s).`,
            severity: 'medium',
            ctaLabel: 'View documents',
            onClick: () => nav('/documents'),
        })
    }

    if (!canBuy) {
        inboxTasks.push({
            id: 'role',
            title: 'Limited permissions',
            description: 'Your role does not allow you to buy tickets. Contact admin if needed.',
            severity: 'low',
            ctaLabel: 'View employees & roles',
            onClick: () => nav('/employees'),
        })
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Company dashboard"
                subtitle="Summary of balances, trips, policies and actions"
                right={
                    <button
                        className="btn-primary"
                        disabled={!canBuy}
                        onClick={() => canBuy && nav('/search')}
                    >
                        Book flight
                    </button>
                }
            />

            {/* Inbox / задачи */}
            <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle size={16} /> Inbox / Actions
                    </div>
                    <div className="text-xs text-slate-500">
                        {inboxTasks.length > 0
                            ? `${inboxTasks.length} item(s) requiring attention`
                            : 'No urgent items (demo)'}
                    </div>
                </div>

                {inboxTasks.length === 0 && (
                    <div className="text-sm text-slate-500">
                        All flows look fine for now. You can start by booking a new trip or reviewing policies.
                    </div>
                )}

                {inboxTasks.length > 0 && (
                    <div className="space-y-2">
                        {inboxTasks.map(task => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between text-sm border-t border-slate-100 pt-2"
                            >
                                <div>
                                    <div
                                        className={
                                            task.severity === 'high'
                                                ? 'font-medium text-rose-700'
                                                : task.severity === 'medium'
                                                    ? 'font-medium text-amber-700'
                                                    : 'font-medium'
                                        }
                                    >
                                        {task.title}
                                    </div>
                                    <div className="text-xs text-slate-500">{task.description}</div>
                                </div>
                                <button className="btn-ghost text-xs whitespace-nowrap" onClick={task.onClick}>
                                    {task.ctaLabel}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Company summary */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Wallet size={16} /> Balance
                    </div>
                    <div className="text-2xl font-semibold mt-1">
                        {company.balance.toLocaleString()} ₸
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Available for instant purchases
                    </div>
                </div>

                <button
                    className="card p-4 text-left hover:shadow-md transition"
                    onClick={() => nav('/tariffs')}
                >
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <CreditCard size={16} /> Tariff
                    </div>
                    <div className="text-2xl font-semibold mt-1">{company.tariff}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {company.tariff === 'FREE' && 'Self-service, no support, pay by personal card'}
                        {company.tariff === 'POSTPAY' && 'Postpay with service fee ~7% and support'}
                        {company.tariff === 'FLEX' && 'VIP support, exchanges/returns and integrations'}
                    </div>
                    <div className="text-xs text-brand-600 mt-2">
                        View tariff details →
                    </div>
                </button>

                <div className="card p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <ShieldCheck size={16} /> Policies
                    </div>
                    <div className="text-lg font-semibold mt-1">Active</div>
                    <div className="text-xs text-slate-500 mt-1">
                        Economy class, max 120 000 ₸ per segment
                    </div>
                    <button
                        className="btn-ghost mt-3"
                        onClick={() => nav('/policies')}
                    >
                        Open policies
                    </button>
                </div>

                {company.tariff === 'POSTPAY' || company.tariff === 'FLEX' ? (
                    <div className="card p-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Clock size={16} /> Postpay
                        </div>
                        <div className="text-lg font-semibold mt-1">
                            Limit: {company.postpayLimit.toLocaleString()} ₸
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Payment due in {company.postpayDueDays} days
                        </div>
                        <div className="mt-3">
                            <MiniBarSingle
                                label="Usage (demo)"
                                used={Math.round(company.postpayLimit * 0.35)}
                                total={company.postpayLimit}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="card p-4 bg-slate-50/60">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <TrendingUp size={16} /> Upgrade
                        </div>
                        <div className="text-sm font-semibold mt-1">Unlock Postpay & support</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Switch to Postpay or Flex to enable delayed payments and exchanges.
                        </div>
                        <button
                            className="btn-primary mt-3"
                            onClick={() => nav('/tariffs')}
                        >
                            View tariffs
                        </button>
                    </div>
                )}
            </div>

            {/* Overall analytics */}
            <div className="grid md:grid-cols-3 gap-4">
                <KpiCard
                    title="Completed trips"
                    value={analytics.allStatus.COMPLETED}
                    hint="Paid and issued docs"
                    accent="ok"
                />
                <KpiCard
                    title="In progress"
                    value={analytics.allStatus.IN_PROGRESS}
                    hint="Baskets and pending flows"
                />
            </div>

            <div className="card p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Trips distribution</div>
                    <div className="text-xs text-slate-500">
                        Total trips: {analytics.total} · Spend: {analytics.totalSpend.toLocaleString()} ₸
                    </div>
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                    <MiniBars
                        title="By status"
                        items={[
                            { label: 'Completed', value: analytics.allStatus.COMPLETED },
                            { label: 'In progress', value: analytics.allStatus.IN_PROGRESS },
                            { label: 'Cancelled', value: analytics.allStatus.CANCELLED },
                        ]}
                    />
                    <MiniBars
                        title="By booking type"
                        items={[
                            {
                                label: 'Single tickets',
                                value:
                                    analytics.flightsStatus.COMPLETED +
                                    analytics.flightsStatus.IN_PROGRESS +
                                    analytics.flightsStatus.CANCELLED,
                            },
                            {
                                label: 'Trip baskets',
                                value:
                                    analytics.basketsStatus.COMPLETED +
                                    analytics.basketsStatus.IN_PROGRESS +
                                    analytics.basketsStatus.CANCELLED,
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Employee activity & upcoming trips */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Employee activity */}
                <div className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Users size={16} /> Employee activity
                        </div>
                        <button
                            className="btn-ghost text-xs"
                            onClick={() => nav('/employees')}
                        >
                            Manage
                        </button>
                    </div>

                    <div className="text-xs text-slate-500">Top travelers</div>
                    {employeeActivity.topTravelers.length === 0 && (
                        <div className="text-sm text-slate-500">No trips yet.</div>
                    )}
                    <div className="space-y-2">
                        {employeeActivity.topTravelers.map(t => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between text-sm border-t border-slate-100 pt-2"
                            >
                                <div>
                                    <div className="font-medium">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.dept || '—'}</div>
                                </div>
                                <div className="text-xs text-slate-600">
                                    {t.count} trips
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-xs text-slate-500 mt-3">Document issues</div>
                    {employeeActivity.docIssues.length === 0 && (
                        <div className="text-xs text-emerald-700 bg-emerald-50/40 border border-emerald-200 rounded-lg p-2">
                            No document issues detected in demo.
                        </div>
                    )}
                    {employeeActivity.docIssues.length > 0 && (
                        <div className="space-y-1">
                            {employeeActivity.docIssues.map(e => (
                                <div
                                    key={e.id}
                                    className="text-xs text-amber-800 bg-amber-50/40 border border-amber-200 rounded-lg p-2"
                                >
                                    {e.name} — missing or expired documents
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming trips */}
                <div className="card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock size={16} /> Upcoming / active trips
                        </div>
                        <button
                            className="btn-ghost text-xs"
                            onClick={() => nav('/documents')}
                        >
                            Open trips
                        </button>
                    </div>

                    {upcomingTrips.length === 0 && (
                        <div className="text-sm text-slate-500">No active trips yet.</div>
                    )}

                    <div className="space-y-2">
                        {upcomingTrips.map(t => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between text-sm border-t border-slate-100 pt-2"
                            >
                                <div>
                                    <div>{t.title}</div>
                                    <div className="text-xs text-slate-500">
                                        {t.type === 'single' ? 'Single ticket' : 'Trip basket'} · {statusLabel(t.status)}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-600">
                                    {t.total.toLocaleString()} ₸
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Policy & compliance + spend insights */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Policy & compliance */}
                <div className="card p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle size={16} /> Policy & compliance
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <SmallKpi
                            label="Cancelled"
                            value={compliance.cancelled}
                        />
                    </div>

                    <div className="text-xs text-slate-500 mt-2">
                        In this prototype, trips with status “Needs approval” are treated as potential policy
                        violations (out-of-policy or over budget).
                    </div>
                </div>

                {/* Spend insights */}
                <div className="card p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp size={16} /> Spend insights (demo)
                    </div>

                    {analytics.monthlyItems.length === 0 && (
                        <div className="text-sm text-slate-500">
                            No spending data yet. After purchases, monthly trends will appear here.
                        </div>
                    )}

                    {analytics.monthlyItems.length > 0 && (
                        <div className="space-y-2">
                            {analytics.monthlyItems.map(m => (
                                <div key={m.month}>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>{m.month}</span>
                                        <span>{m.value.toLocaleString()} ₸</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-brand-500/70"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (m.value / (analytics.totalSpend || 1)) * 100 * 1.5
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions + support */}
            <div className="grid md:grid-cols-3 gap-4">
                <Action
                    title="Book flight / train"
                    icon={Plane}
                    onClick={() => nav('/search')}
                    disabled={!canBuy}
                />
                <Action
                    title="Build full trip"
                    icon={ShoppingCart}
                    onClick={() => nav('/trip/new')}
                    disabled={!canBuildTrip}
                />
                <Action
                    title="Closing documents"
                    icon={FileText}
                    onClick={() => nav('/documents')}
                />
                <Action
                    title="Policies & approvals"
                    icon={ShieldCheck}
                    onClick={() => nav('/policies')}
                />
                <Action
                    title="Employees & access"
                    icon={Users}
                    onClick={() => nav('/employees')}
                />
                <Action
                    title={company.tariff === 'FLEX' ? '24/7 VIP support' : 'Support / FAQ'}
                    icon={LifeBuoy}
                    onClick={() => nav('/support')}
                />
            </div>

            {/* News / updates */}
            <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <div className="text-sm font-medium">Product updates (demo)</div>
                    <ul className="text-xs text-slate-600 mt-1 list-disc pl-4 space-y-1">
                        <li>Rail (RW) search added to the main search flow.</li>
                        <li>Employee documents now checked during booking.</li>
                        <li>Closing documents download is available per trip or for all trips.</li>
                    </ul>
                </div>
                <button className="btn-ghost text-xs" onClick={() => nav('/support')}>
                    View all updates & FAQ
                </button>
            </div>
        </div>
    )
}

/* === Helpers / small components === */

function KpiCard({
                     title,
                     value,
                     hint,
                     accent,
                     onClick,
                 }: {
    title: string
    value: number
    hint: string
    accent?: 'warn' | 'ok'
    onClick?: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`card p-4 text-left transition ${
                onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
            }`}
        >
            <div className="text-sm text-slate-500">{title}</div>
            <div
                className={`text-2xl font-semibold mt-1 ${
                    accent === 'warn'
                        ? 'text-amber-700'
                        : accent === 'ok'
                            ? 'text-emerald-700'
                            : ''
                }`}
            >
                {value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{hint}</div>
        </button>
    )
}

function MiniBars({
                      title,
                      items,
                  }: {
    title: string
    items: { label: string; value: number }[]
}) {
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
                            <div
                                className="h-full bg-brand-500/70"
                                style={{ width: `${(i.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MiniBarSingle({
                           label,
                           used,
                           total,
                       }: {
    label: string
    used: number
    total: number
}) {
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
                <div
                    className="h-full bg-brand-500/70"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

function SmallKpi({
                      label,
                      value,
                      warn,
                  }: {
    label: string
    value: number
    warn?: boolean
}) {
    return (
        <div
            className={`rounded-xl border border-slate-100 p-3 ${
                warn && value > 0 ? 'bg-amber-50/60 border-amber-200' : ''
            }`}
        >
            <div className="text-xs text-slate-500">{label}</div>
            <div
                className={`text-lg font-semibold mt-0.5 ${
                    warn && value > 0 ? 'text-amber-700' : ''
                }`}
            >
                {value}
            </div>
        </div>
    )
}

function Action({
                    title,
                    icon: Icon,
                    onClick,
                    disabled,
                }: {
    title: string
    icon: any
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            onClick={() => !disabled && onClick()}
            className={`card p-4 text-left transition flex flex-col justify-between ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
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
            return 'Completed'
        case 'IN_PROGRESS':
            return 'In progress'
        case 'CANCELLED':
            return 'Cancelled'
        default:
            return String(s)
    }
}