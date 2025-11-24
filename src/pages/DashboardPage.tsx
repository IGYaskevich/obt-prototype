import React from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { ArrowRight, Wallet, CreditCard, FileText, ShieldCheck, Plane, ShoppingCart, LifeBuoy } from 'lucide-react'

export default function DashboardPage() {
  const { company, trips } = useStore()
  const nav = useNavigate()
  if (!company) return null

  const isPostpay = company.tariff === 'POSTPAY'
  const isFlex = company.tariff === 'FLEX'

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Company dashboard"
        subtitle="Key balances, tariff, and quick actions"
        right={<button className="btn-primary" onClick={()=>nav('/search')}>Buy ticket</button>}
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Wallet size={16}/>Balance</div>
          <div className="text-2xl font-semibold mt-1">{company.balance.toLocaleString()} ₸</div>
          <div className="text-xs text-slate-500 mt-1">Available for instant purchases</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><CreditCard size={16}/>Tariff</div>
          <div className="text-2xl font-semibold mt-1">{company.tariff}</div>
          <div className="text-xs text-slate-500 mt-1">
            {company.tariff==='FREE' && 'Self-serve only, no support, pay by personal card'}
            {company.tariff==='POSTPAY' && 'Postpay purchases with service fee ~7%'}
            {company.tariff==='FLEX' && 'VIP support, exchanges/returns enabled'}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><ShieldCheck size={16}/>Policies</div>
          <div className="text-lg font-semibold mt-1">Active</div>
          <div className="text-xs text-slate-500 mt-1">Economy class, max 120k₸ per flight</div>
          <button className="btn-ghost mt-3" onClick={()=>nav('/policies')}>Open policies</button>
        </div>
      </div>

      {isPostpay && (
        <div className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-brand-100">
          <div>
            <div className="text-sm text-slate-500">Postpay limit</div>
            <div className="text-xl font-semibold">{company.postpayLimit.toLocaleString()} ₸</div>
            <div className="text-xs text-slate-500">Payment due in {company.postpayDueDays} days</div>
          </div>
          <button className="btn-primary" onClick={()=>nav('/documents')}>View invoices</button>
        </div>
      )}

      {isFlex && (
        <div className="card p-4 border-emerald-100 bg-emerald-50/30">
          <div className="text-sm font-medium">Flex / VIP perks enabled</div>
          <ul className="text-sm text-slate-600 mt-2 list-disc pl-5 space-y-1">
            <li>24/7 priority support</li>
            <li>Any ticket exchanges/returns from your trips</li>
            <li>White VIP cards across UI</li>
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Action title="Book flight / train" icon={Plane} onClick={()=>nav('/search')} />
        <Action title="Build a full trip" icon={ShoppingCart} onClick={()=>nav('/trip/new')} />
        <Action title="Trip history" icon={FileText} onClick={()=>nav('/documents')} />
        <Action title="Policies / approvals" icon={ShieldCheck} onClick={()=>nav('/policies')} />
        <Action title="Closing documents" icon={FileText} onClick={()=>nav('/documents')} />
        <Action title="Support" icon={LifeBuoy} onClick={()=>nav('/support')} />
      </div>

      <div className="card p-4">
        <div className="text-sm font-medium mb-2">Recent trips (demo)</div>
        {trips.length===0 && <div className="text-sm text-slate-500">No trips yet. Create one to see it here.</div>}
        {trips.slice(0,3).map((t,i)=>(
          <div key={i} className="flex items-center justify-between py-2 border-t border-slate-100 text-sm">
            <div>{t.title}</div>
            <div className="text-slate-500">{t.total.toLocaleString()} ₸</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Action({ title, icon:Icon, onClick }:{title:string; icon:any; onClick:()=>void}) {
  return (
    <button onClick={onClick} className="card p-4 text-left hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <Icon size={18} /> {title}
        </div>
        <ArrowRight size={16} className="text-slate-400"/>
      </div>
    </button>
  )
}
