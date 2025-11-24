import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../state/store'

export default function DocumentsPage() {
  const { company, trips } = useStore()
  const [params] = useSearchParams()
  const status = params.get('status')

  const hasDocsForPersonal = false

  return (
    <div className="space-y-5">
      <SectionHeader title="Closing documents" subtitle="Invoices/acts bound to payment method" />

      {status==='success' && (
        <div className="card p-4 border-emerald-200 bg-emerald-50/30 text-sm">
          Ticket purchased successfully. Closing documents issued (if eligible).
        </div>
      )}
      {status==='trip' && (
        <div className="card p-4 border-emerald-200 bg-emerald-50/30 text-sm">
          Trip basket confirmed. Documents will appear here.
        </div>
      )}

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">Eligibility</div>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>Company balance / corporate card → documents available</li>
          <li>Personal card → documents not available</li>
        </ul>
      </div>

      <div className="card p-4">
        <div className="text-sm font-medium mb-2">Documents list (demo)</div>
        {trips.length===0 && <div className="text-sm text-slate-500">No documents yet.</div>}
        {trips.map((t,i)=>(
          <div key={i} className="flex items-center justify-between py-2 border-t border-slate-100 text-sm">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-slate-500">Payment: {company?.tariff==='FREE' ? 'Personal card' : 'Company'}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-slate-500">{t.total.toLocaleString()} ₸</div>
              <button className="btn-ghost">Invoice PDF</button>
              <button className="btn-ghost">Act PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
