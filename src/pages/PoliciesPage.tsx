import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import PolicyBadge from '../components/PolicyBadge'

export default function PoliciesPage() {
  const [level, setLevel] = useState<'low'|'mid'|'high'>('mid')
  return (
    <div className="space-y-5">
      <SectionHeader title="Policies & approvals" subtitle="Where restrictions are visible to user" />

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">Policy levels</div>
        <div className="grid md:grid-cols-3 gap-2">
          <PolicyCard title="Cost limit" value={level==='low'?'80k₸':'120k₸'} note="Per flight/train segment" />
          <PolicyCard title="Class" value="Economy" note="Business class requires approval" />
          <PolicyCard title="Time window" value="06:00–23:00" note="Night flights need approval" />
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">When restrictions apply</div>
        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
          <li>During search results: badge on each option</li>
          <li>At selection: warning or block with “Request approval”</li>
          <li>After booking: audit log (mock)</li>
        </ul>
      </div>

      <div className="card p-4 space-y-3">
        <div className="text-sm font-medium">Approval flow (mock)</div>
        <div className="text-sm text-slate-600">
          If option is <PolicyBadge level="BLOCK" /> — user must request approval before payment.
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Approvers: Manager → Finance (demo)
        </div>
        <div className="mt-3 text-sm font-medium">Approval history</div>
        <div className="text-sm text-slate-500">No approvals yet.</div>
      </div>
    </div>
  )
}

function PolicyCard({ title, value, note }:{title:string; value:string; note:string}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{note}</div>
    </div>
  )
}
