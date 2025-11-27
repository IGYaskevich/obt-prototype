import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import PolicyBadge from '../components/PolicyBadge'

export default function TicketPurchasePage() {
    const nav = useNavigate()
    const {
        company,
        selectedFlight,
        addTrip,
        hasPermission,
        employees,
        getEmployeeById,
        employeeHasValidDocs,
    } = useStore()

    const canBuy = hasPermission('BUY')

    const [paymentMethod, setPaymentMethod] = useState<'balance' | 'corp' | 'postpay' | 'personal'>('balance')
    const [approved, setApproved] = useState(false)
    const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id || '')

    const [isPaying, setIsPaying] = useState(false)
    const [paidTripId, setPaidTripId] = useState<string | null>(null)

    if (!company || !selectedFlight) {
        return (
            <div className="space-y-4">
                <SectionHeader title="Ticket purchase" subtitle="No selected flight in demo" />
                <button className="btn-primary" onClick={() => nav('/search')}>Back to search</button>
            </div>
        )
    }

    const needsApproval = selectedFlight.policy === 'BLOCK'
    const serviceFeePct = company.tariff === 'POSTPAY' ? 0.07 : company.tariff === 'FLEX' ? 0.04 : 0
    const serviceFee = Math.round(selectedFlight.price * serviceFeePct)
    const total = selectedFlight.price + serviceFee

    const employee = getEmployeeById(employeeId)
    const hasDocs = employeeId ? employeeHasValidDocs(employeeId) : false

    const canPayNow = canBuy && !!employeeId && hasDocs && (!needsApproval || approved)

    const docsSummary = useMemo(() => {
        if (!employee) return []
        return employee.documents.map(d => ({
            ...d,
            label:
                d.type === 'PASSPORT' ? 'Passport' :
                    d.type === 'ID_CARD' ? 'ID card' :
                        'Visa',
        }))
    }, [employee])

    const onPay = () => {
        if (!canPayNow || isPaying) return

        setIsPaying(true)

        // имитация оплаты
        setTimeout(() => {
            const tripId = crypto.randomUUID()

            addTrip({
                id: tripId, // store игнорит id, но нам нужен для редиректа — поэтому ниже используем paidTripId
                title: `Trip ${selectedFlight.from}-${selectedFlight.to}`,
                total,
                type: 'single',
                status: needsApproval ? 'NEEDS_APPROVAL' : 'COMPLETED',
                employeeId,
            } as any)

            setPaidTripId(tripId)
            setIsPaying(false)

            nav(`/documents?last=${tripId}`)
        }, 1200)
    }

    return (
        <div className="space-y-5">
            <SectionHeader title="Ticket purchase" subtitle="Single booking flow with employee selection" />

            {/* Selected flight */}
            <div className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="font-medium">
                        {selectedFlight.from} → {selectedFlight.to}
                    </div>
                    <PolicyBadge level={selectedFlight.policy} />
                </div>
                <div className="text-sm text-slate-600">
                    {selectedFlight.date} · {selectedFlight.depart}–{selectedFlight.arrive} · {selectedFlight.carrier}
                </div>
                <div className="text-sm">
                    Price: <b>{selectedFlight.price.toLocaleString()} ₸</b>
                </div>
            </div>

            {/* Employee selection */}
            <div className="card p-4 space-y-3">
                <div className="text-sm font-medium">Booked for employee</div>

                <select
                    className="select"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    disabled={isPaying}
                >
                    {employees.map(e => (
                        <option key={e.id} value={e.id}>
                            {e.name} · {e.department || '—'}
                        </option>
                    ))}
                </select>

                {employee && (
                    <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                        <div className="text-xs text-slate-500">Documents for {employee.name}</div>

                        {docsSummary.length === 0 && (
                            <div className="text-sm text-amber-800 bg-amber-50/40 border border-amber-200 rounded-lg p-2">
                                No documents. Booking is blocked in demo.
                            </div>
                        )}

                        {docsSummary.length > 0 && (
                            <div className="space-y-1">
                                {docsSummary.map(d => (
                                    <div key={d.type} className="flex items-center justify-between text-sm border-t border-slate-100 pt-1">
                                        <div>
                                            {d.label}: {d.number}
                                            <span className="text-xs text-slate-500 ml-2">exp {d.expirationDate}</span>
                                        </div>
                                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                                            d.status === 'VALID'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : d.status === 'EXPIRED'
                                                    ? 'bg-rose-50 text-rose-700'
                                                    : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {d.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasDocs && (
                            <div className="text-xs text-rose-700 mt-1">
                                At least one valid Passport or ID card is required.
                            </div>
                        )}

                        <div className="text-xs text-slate-500">
                            Manage documents in Employees page (mock).
                        </div>
                    </div>
                )}
            </div>

            {/* Fees */}
            <div className="card p-4 space-y-2">
                <div className="text-sm font-medium">Fees</div>
                <div className="flex justify-between text-sm">
                    <span>Base price</span>
                    <span>{selectedFlight.price.toLocaleString()} ₸</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Service fee ({Math.round(serviceFeePct * 100)}%)</span>
                    <span>{serviceFee.toLocaleString()} ₸</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-2">
                    <span>Total</span>
                    <span>{total.toLocaleString()} ₸</span>
                </div>
            </div>

            {/* Payment */}
            <div className="card p-4 space-y-3">
                <div className="text-sm font-medium">Payment</div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'balance'}
                        onChange={() => setPaymentMethod('balance')}
                        disabled={isPaying}
                    />
                    Company balance (docs available)
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'corp'}
                        onChange={() => setPaymentMethod('corp')}
                        disabled={isPaying}
                    />
                    Corporate card (docs available)
                </label>

                {company.tariff !== 'FREE' && (
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="pm"
                            checked={paymentMethod === 'postpay'}
                            onChange={() => setPaymentMethod('postpay')}
                            disabled={isPaying}
                        />
                        Postpay (due in {company.postpayDueDays} days)
                    </label>
                )}

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === 'personal'}
                        onChange={() => setPaymentMethod('personal')}
                        disabled={isPaying}
                    />
                    Personal card (no closing docs)
                </label>

                {!canBuy && (
                    <div className="text-xs text-rose-700">
                        Your role is Viewer. Buying is disabled.
                    </div>
                )}
            </div>

            {/* Approval */}
            {needsApproval && (
                <div className="card p-4 space-y-2 border-amber-200 bg-amber-50/30">
                    <div className="text-sm font-medium">Out of policy</div>
                    <div className="text-sm text-slate-600">
                        This option exceeds policy. Approval is required.
                    </div>
                    <button className="btn-primary" disabled={isPaying} onClick={() => setApproved(true)}>
                        Approve (mock)
                    </button>
                </div>
            )}

            {/* Pay */}
            <div className="flex items-center justify-end gap-2">
                <button className="btn-ghost" disabled={isPaying} onClick={() => nav(-1)}>Back</button>
                <button className="btn-primary" disabled={!canPayNow || isPaying} onClick={onPay}>
                    {isPaying ? 'Processing payment…' : 'Pay & issue docs'}
                </button>
            </div>

            {isPaying && (
                <div className="card p-4 text-sm text-slate-600 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                    Payment is processing. Please wait.
                </div>
            )}

            {paidTripId && !isPaying && (
                <div className="text-xs text-slate-500">
                    Payment succeeded. Trip #{paidTripId.slice(0, 6)} created.
                </div>
            )}
        </div>
    )
}