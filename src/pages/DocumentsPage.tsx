import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'

type DocKind = 'ticket' | 'invoice' | 'act' | 'receipt'

export default function DocumentsPage() {
    const { trips, company, employees } = useStore()
    const [params] = useSearchParams()
    const lastId = params.get('last')

    const tripsWithEmployees = useMemo(() => {
        return trips.map(t => ({
            ...t,
            employee: employees.find(e => e.id === t.employeeId),
        }))
    }, [trips, employees])

    const downloadFile = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const makeDocContent = (tripId: string, kind: DocKind) => {
        const trip = tripsWithEmployees.find(t => t.id === tripId)
        const emp = trip?.employee
        const tariff = company?.tariff ?? 'FREE'
        return [
            `OBT Prototype Document`,
            `Kind: ${kind.toUpperCase()}`,
            `Trip ID: ${tripId}`,
            `Title: ${trip?.title}`,
            `Employee: ${emp?.name ?? '—'} (${emp?.email ?? '—'})`,
            `Tariff: ${tariff}`,
            `Total: ${trip?.total?.toLocaleString()} ₸`,
            `Generated at: ${new Date().toISOString()}`,
        ].join('\n')
    }

    const downloadTripDoc = (tripId: string, kind: DocKind) => {
        const filename = `${kind}_${tripId.slice(0, 6)}.txt`
        downloadFile(filename, makeDocContent(tripId, kind))
    }

    const downloadTripAllDocs = (tripId: string, includeClosingDocs: boolean) => {
        // ticket всегда
        downloadTripDoc(tripId, 'ticket')
        if (!includeClosingDocs) return
        downloadTripDoc(tripId, 'invoice')
        downloadTripDoc(tripId, 'act')
        downloadTripDoc(tripId, 'receipt')
    }

    const downloadAllDocs = () => {
        tripsWithEmployees.forEach(t => {
            const includeClosingDocs = t.status !== 'CANCELLED' && t.employeeId && company
                ? true
                : true
            // demo rule below will still be applied per trip
            downloadTripAllDocs(t.id, canHaveClosingDocs(t))
        })
    }

    const canHaveClosingDocs = (trip: (typeof tripsWithEmployees)[number]) => {
        // демо-правило: если метод оплаты был personal — у нас нет данных о методе в trip,
        // поэтому используем простую заглушку:
        // Free тариф — закрывающие есть только у COMPLETED, иначе нет.
        if (!company) return false
        if (company.tariff === 'FREE') return trip.status === 'COMPLETED'
        return trip.status !== 'CANCELLED'
    }

    return (
        <div className="space-y-5">
            <SectionHeader
                title="Closing documents"
                subtitle="Download tickets and accounting documents"
                right={
                    tripsWithEmployees.length > 0 ? (
                        <button className="btn-primary" onClick={downloadAllDocs}>
                            Download all documents
                        </button>
                    ) : undefined
                }
            />

            {tripsWithEmployees.length === 0 && (
                <div className="card p-4 text-sm text-slate-600">
                    No trips yet. After purchase, documents will appear here.
                </div>
            )}

            <div className="space-y-3">
                {tripsWithEmployees.map(trip => {
                    const highlight = lastId && trip.id === lastId
                    const closingAllowed = canHaveClosingDocs(trip)

                    return (
                        <div
                            key={trip.id}
                            className={`card p-4 space-y-3 ${highlight ? 'ring-2 ring-brand-100' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{trip.title}</div>
                                    <div className="text-xs text-slate-500">
                                        {trip.type === 'single' ? 'Single ticket' : 'Trip basket'} · {trip.status}
                                    </div>
                                    {trip.employee && (
                                        <div className="text-xs text-slate-500">
                                            Employee: {trip.employee.name}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-semibold">
                                    {trip.total.toLocaleString()} ₸
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="btn-ghost"
                                    onClick={() => downloadTripDoc(trip.id, 'ticket')}
                                >
                                    Download ticket
                                </button>

                                <button
                                    className="btn-ghost"
                                    disabled={!closingAllowed}
                                    onClick={() => downloadTripDoc(trip.id, 'invoice')}
                                >
                                    Invoice
                                </button>

                                <button
                                    className="btn-ghost"
                                    disabled={!closingAllowed}
                                    onClick={() => downloadTripDoc(trip.id, 'act')}
                                >
                                    Act
                                </button>

                                <button
                                    className="btn-ghost"
                                    disabled={!closingAllowed}
                                    onClick={() => downloadTripDoc(trip.id, 'receipt')}
                                >
                                    Receipt
                                </button>

                                <button
                                    className="btn-primary"
                                    onClick={() => downloadTripAllDocs(trip.id, closingAllowed)}
                                >
                                    Download all for this trip
                                </button>
                            </div>

                            {!closingAllowed && (
                                <div className="text-xs text-amber-800 bg-amber-50/40 border border-amber-200 rounded-lg p-2">
                                    Closing documents are not available for this trip (demo rule based on tariff/status/payment).
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}