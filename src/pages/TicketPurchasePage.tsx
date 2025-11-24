import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import PolicyBadge from '../components/PolicyBadge'
import { useStore } from '../state/store'

type PayMethod = 'BALANCE' | 'CORP_CARD' | 'PERSONAL_CARD' | 'POSTPAY'

export default function TicketPurchasePage() {
  const nav = useNavigate()
  const { selectedFlight, company, addTrip } = useStore()
  const [method, setMethod] = useState<PayMethod>('BALANCE')
  const [approved, setApproved] = useState(false)

  if (!selectedFlight || !company) {
    return (
      <div className="card p-6">
        <div className="text-sm">No ticket selected. Go back to results.</div>
        <button className="btn-primary mt-3" onClick={()=>nav('/search/results')}>Back</button>
      </div>
    )
  }

  const serviceFeePct = company.tariff === 'POSTPAY' ? 0.07 : company.tariff === 'FLEX' ? 0.04 : 0
  const serviceFee = Math.round(selectedFlight.price * serviceFeePct)
  const total = selectedFlight.price + serviceFee

  const needsApproval = selectedFlight.policy === 'BLOCK'
  const showPostpay = company.tariff === 'POSTPAY'
  const showFlex = company.tariff === 'FLEX'

  const payOptions: { id: PayMethod; label: string; hint: string; disabled?: boolean }[] = [
    { id:'BALANCE', label:'Company balance', hint:'Closing documents included', disabled: company.tariff==='FREE' },
    { id:'CORP_CARD', label:'Corporate card', hint:'No top-up required', disabled: company.tariff==='FREE' },
    { id:'POSTPAY', label:'Postpay', hint:`Pay within ${company.postpayDueDays} days`, disabled: !showPostpay },
    { id:'PERSONAL_CARD', label:'Personal card', hint:'No closing documents', disabled: false },
  ]

  return (
    <div className="space-y-5">
      <SectionHeader title="Ticket purchase" subtitle="Flow: select → fees → pay → docs → status" />

      <div className={`card p-4 ${showFlex ? 'border-emerald-200' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">{selectedFlight.date}</div>
            <div className="text-lg font-semibold">{selectedFlight.from} → {selectedFlight.to}</div>
            <div className="text-sm">{selectedFlight.depart} – {selectedFlight.arrive} · {selectedFlight.carrier}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">{selectedFlight.price.toLocaleString()} ₸</div>
            <PolicyBadge level={selectedFlight.policy} />
          </div>
        </div>

        {showFlex && (
          <div className="mt-3 text-xs text-emerald-700">
            VIP ticket: exchanges/returns allowed.
          </div>
        )}
      </div>

      {needsApproval && !approved && (
        <div className="card p-4 border-rose-200 bg-rose-50/30">
          <div className="text-sm font-medium text-rose-800">Out of policy</div>
          <div className="text-sm text-rose-700 mt-1">
            This option exceeds policy. Approval required before purchase.
          </div>
          <button className="btn-primary mt-3" onClick={()=>setApproved(true)}>Request approval (mock)</button>
        </div>
      )}

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">Fees</div>
        <Row label="Ticket price" value={`${selectedFlight.price.toLocaleString()} ₸`} />
        <Row label={`Service fee (${Math.round(serviceFeePct*100)}%)`} value={`${serviceFee.toLocaleString()} ₸`} />
        <Row label="Total" value={`${total.toLocaleString()} ₸`} bold />
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">Payment method</div>
        <div className="grid md:grid-cols-2 gap-2">
          {payOptions.map(o => (
            <label key={o.id} className={`p-3 rounded-xl border text-sm cursor-pointer ${method===o.id?'border-brand-500 bg-brand-50':'border-slate-200'} ${o.disabled?'opacity-50 cursor-not-allowed':''}`}>
              <input type="radio" className="mr-2" checked={method===o.id} onChange={()=>!o.disabled && setMethod(o.id)} />
              <div className="font-medium">{o.label}</div>
              <div className="text-xs text-slate-500">{o.hint}</div>
            </label>
          ))}
        </div>

        {method==='POSTPAY' && showPostpay && (
          <div className="text-xs text-slate-600">
            This purchase goes to postpay. Due date: in {company.postpayDueDays} days (mock).
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={()=>nav('/search/results')}>Back</button>
        <button
          className="btn-primary"
          disabled={(needsApproval && !approved)}
          onClick={()=>{
            addTrip({ title:`Trip ${selectedFlight.from}-${selectedFlight.to}`, total, type:'single' })
            nav('/documents?status=success')
          }}
        >
          Pay & issue docs
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, bold }:{label:string; value:string; bold?:boolean}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-slate-600">{label}</div>
      <div className={bold?'font-semibold':''}>{value}</div>
    </div>
  )
}
