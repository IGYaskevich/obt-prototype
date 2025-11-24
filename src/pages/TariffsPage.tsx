import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { Tariff, useStore } from '../state/store'

const cards: { id: Tariff; title: string; bullets: string[] }[] = [
  { id:'FREE', title:'Free', bullets:[
    '1–2 step purchase',
    'No support',
    'Only personal card',
    'Basic closing docs',
  ]},
  { id:'POSTPAY', title:'Postpay', bullets:[
    'Deferred payment',
    'Limit & due date hints',
    'Service fee ~7%',
    'Chat/tickets support',
  ]},
  { id:'FLEX', title:'Flex / VIP', bullets:[
    'Priority 24/7 support',
    'Any exchanges/returns',
    'API integrations',
    'VIP white cards',
  ]},
]

export default function TariffsPage() {
  const { company, setTariff } = useStore()
  if (!company) return null
  return (
    <div className="space-y-5">
      <SectionHeader title="Tariffs (demo switch)" subtitle="Shows behavior differences across UI" />
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(c=>(
          <div key={c.id} className={`card p-4 ${company.tariff===c.id?'border-brand-200 ring-2 ring-brand-50':''}`}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{c.title}</div>
              {company.tariff===c.id && <span className="badge-brand">Active</span>}
            </div>
            <ul className="mt-3 text-sm text-slate-600 list-disc pl-5 space-y-1">
              {c.bullets.map((b,i)=><li key={i}>{b}</li>)}
            </ul>
            <button className="btn-primary w-full mt-4" onClick={()=>setTariff(c.id)}>
              Use {c.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
