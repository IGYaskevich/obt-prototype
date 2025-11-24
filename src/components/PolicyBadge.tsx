import React from 'react'
import { PolicyLevel } from '../state/store'

const map: Record<PolicyLevel, { label: string; cls: string }> = {
  OK: { label: 'Within policy', cls: 'badge-ok' },
  WARN: { label: 'Policy warning', cls: 'badge-warn' },
  BLOCK: { label: 'Out of policy', cls: 'bg-rose-50 text-rose-700' },
}

export default function PolicyBadge({ level }: { level: PolicyLevel }) {
  const m = map[level]
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}
