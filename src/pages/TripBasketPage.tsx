import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import PolicyBadge from '../components/PolicyBadge'
import { useStore } from '../state/store'

type ItemType = 'FLIGHT' | 'HOTEL' | 'INSURANCE' | 'TRANSFER' | 'VISA' | 'ROAMING' | 'TAXI'

const catalog: { type: ItemType; title: string; price: number; policy: 'OK'|'WARN'|'BLOCK' }[] = [
  { type:'FLIGHT', title:'Flight Almaty → Astana', price: 42000, policy:'OK' },
  { type:'HOTEL', title:'Hotel 2 nights', price: 90000, policy:'WARN' },
  { type:'INSURANCE', title:'Travel insurance', price: 4500, policy:'OK' },
  { type:'TRANSFER', title:'Airport transfer', price: 7000, policy:'OK' },
  { type:'VISA', title:'Visa support', price: 35000, policy:'OK' },
  { type:'ROAMING', title:'Roaming package', price: 3000, policy:'OK' },
  { type:'TAXI', title:'Taxi in city', price: 5000, policy:'OK' },
]

export default function TripBasketPage() {
  const nav = useNavigate()
  const { company, addTrip } = useStore()
  const [items, setItems] = useState<typeof catalog>([catalog[0]])

  const total = useMemo(()=>items.reduce((s,i)=>s+i.price,0),[items])
  const worstPolicy = useMemo(()=> items.some(i=>i.policy==='BLOCK') ? 'BLOCK' : items.some(i=>i.policy==='WARN') ? 'WARN' : 'OK', [items])

  const canPostpay = company?.tariff==='POSTPAY'
  const canFlex = company?.tariff==='FLEX'

  return (
    <div className="space-y-5">
      <SectionHeader title="Create business trip" subtitle="Basket of services in one flow" />

      <div className="grid md:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          <div className="card p-4">
            <div className="text-sm font-medium mb-2">Add services</div>
            <div className="grid md:grid-cols-2 gap-2">
              {catalog.map(c=>(
                <button
                  key={c.type}
                  onClick={()=>setItems(prev=>[...prev,c])}
                  className="p-3 rounded-xl border border-slate-200 text-left hover:bg-slate-50"
                >
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.price.toLocaleString()} ₸</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-medium mb-2">Trip structure</div>
            <div className="text-xs text-slate-500 mb-2">Dates: 02 Dec 2025 – 04 Dec 2025 (mock)</div>
            <div className="space-y-2">
              {items.map((i,idx)=>(
                <div key={idx} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-medium">{i.title}</div>
                    <PolicyBadge level={i.policy} />
                  </div>
                  <div className="text-slate-700">{i.price.toLocaleString()} ₸</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card p-4 space-y-2">
            <div className="text-sm font-medium">Summary</div>
            <Row label="Services total" value={`${total.toLocaleString()} ₸`} />
            <Row label="Policy status" value={<PolicyBadge level={worstPolicy as any} />} />
            {worstPolicy==='BLOCK' && (
              <div className="text-xs text-rose-700">Approval required for some items.</div>
            )}
          </div>

          <div className="card p-4 space-y-2">
            <div className="text-sm font-medium">Payment</div>
            {company?.tariff==='FREE' && (
              <div className="text-sm text-slate-600">
                Free tariff: only personal card payments, no closing docs.
              </div>
            )}
            {canPostpay && <div className="text-sm text-slate-600">Postpay available (due in {company?.postpayDueDays} days)</div>}
            {canFlex && <div className="text-sm text-slate-600">Flex: priority support + exchanges enabled</div>}

            <button
              className="btn-primary w-full mt-2"
              onClick={()=>{
                  addTrip({
                      title: 'Trip basket',
                      total,
                      type: 'basket',
                      status: worstPolicy === 'BLOCK' ? 'NEEDS_APPROVAL' : 'IN_PROGRESS',
                  })
                  nav('/documents?status=trip')
              }}
            >
              Confirm trip (mock)
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={()=>nav('/dashboard')}>Back to dashboard</button>
      </div>
    </div>
  )
}

function Row({ label, value }:{label:string; value:any}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-slate-600">{label}</div>
      <div>{value}</div>
    </div>
  )
}
