import React from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import PolicyBadge from '../components/PolicyBadge'
import { useStore } from '../state/store'

export default function ResultsPage() {
  const nav = useNavigate()
  const { flights, selectFlight, company } = useStore()

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Search results"
        subtitle="Cards show policy status and tariff marker"
        right={
          <button className="btn-ghost" onClick={() => nav('/search')}>
            Edit search
          </button>
        }
      />

      <div className="flex items-center gap-2">
        <span className="badge-brand">Tariff: {company?.tariff}</span>
        <span className="badge">Filters (mock)</span>
        <span className="badge">Sort (mock)</span>
      </div>

      <div className="space-y-3">
        {flights.map(f => (
          <div key={f.id} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm text-slate-500">{f.date}</div>
              <div className="text-lg font-semibold">
                {f.from} → {f.to}
              </div>
              <div className="text-sm text-slate-700">
                {f.depart} – {f.arrive} · {f.carrier}
              </div>
              <div className="mt-2">
                <PolicyBadge level={f.policy} />
              </div>
              {f.policy === 'BLOCK' && (
                <div className="text-xs text-rose-700 mt-1">Requires approval or choose another option.</div>
              )}
            </div>

            <div className="text-right">
              <div className="text-xl font-semibold">{f.price.toLocaleString()} ₸</div>
              <div className="text-xs text-slate-500 mt-1">Service fee depends on tariff</div>
              <button
                className="btn-primary mt-2"
                onClick={() => {
                  selectFlight(f.id)
                  nav('/ticket/purchase')
                }}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
