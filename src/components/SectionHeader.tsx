import React from 'react'

export default function SectionHeader({ title, subtitle, right }:{
  title: string; subtitle?: string; right?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
