import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'

export default function SearchPage() {
  const nav = useNavigate()
  const { company } = useStore()
  const [from, setFrom] = useState('Almaty')
  const [to, setTo] = useState('Astana')
  const [date, setDate] = useState('2025-12-02')
  const [pax, setPax] = useState(1)

  return (
    <div className="space-y-5">
      <SectionHeader title="Search flights / trains" subtitle="Simple search form for Free / Postpay / Flex" />
      <div className="card p-4 grid md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-slate-500">From</label>
          <input className="input mt-1" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">To</label>
          <input className="input mt-1" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Date</label>
          <input type="date" className="input mt-1" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Passengers</label>
          <input type="number" min={1} className="input mt-1" value={pax} onChange={e=>setPax(Number(e.target.value))} />
        </div>
        <div className="md:col-span-4 flex items-center justify-between mt-1">
          <div className="text-sm text-slate-600">Company tariff: <span className="badge-brand ml-1">{company?.tariff}</span></div>
          <button className="btn-primary" onClick={() => nav('/search/results')}>Search</button>
        </div>
      </div>

      <div className="text-sm text-slate-600">
        Note: train results are mocked together with flights.
      </div>
    </div>
  )
}
