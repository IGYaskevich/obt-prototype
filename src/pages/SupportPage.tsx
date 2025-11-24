import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'

export default function SupportPage() {
  const { company } = useStore()
  const t = company?.tariff

  return (
    <div className="space-y-5">
      <SectionHeader title="Support" subtitle="Different levels by tariff" />

      {t==='FREE' && (
        <div className="card p-4 space-y-2">
          <div className="text-sm font-medium">Free tariff</div>
          <div className="text-sm text-slate-600">Only FAQ is available.</div>
          <button className="btn-primary">Open FAQ (mock)</button>
        </div>
      )}

      {t==='POSTPAY' && (
        <div className="card p-4 space-y-2">
          <div className="text-sm font-medium">Postpay tariff</div>
          <div className="text-sm text-slate-600">Chat / tickets with delay.</div>
          <textarea className="input min-h-[120px]" placeholder="Describe your issue..." />
          <button className="btn-primary">Create ticket (mock)</button>
        </div>
      )}

      {t==='FLEX' && (
        <div className="card p-4 space-y-2 border-emerald-200">
          <div className="text-sm font-medium">Flex / VIP tariff</div>
          <div className="text-sm text-slate-600">24/7 priority chat and call.</div>
          <div className="flex gap-2">
            <button className="btn-primary">Start chat (mock)</button>
            <button className="btn-ghost">Call manager (mock)</button>
          </div>
        </div>
      )}
    </div>
  )
}
