// @ts-nocheck
import React from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useStore } from '../state/store'

export function PenaltySummaryWidget() {
   const { penalties = [] } = useStore()

   const unpaid = penalties.filter(p => p.status === 'UNPAID')
   const totalUnpaid = unpaid.reduce((s, p) => s + p.amount, 0)

   const mostCommon = (() => {
      const map = new Map()
      penalties.forEach(p => map.set(p.type, (map.get(p.type) || 0) + 1))
      if (map.size === 0) return null
      return [...map.entries()].sort((a, b) => b[1] - a[1])[0][0]
   })()

   const pretty = {
      POLICY_VIOLATION: 'Policy violation',
      NO_SHOW: 'No-show',
      PAID_CANCELLATION: 'Paid cancellation',
      LATE_BOOKING: 'Late booking',
      WRONG_CLASS: 'Wrong class',
      OUT_OF_POLICY_TIME: 'Out-of-policy time',
      CHANGE_FEE: 'Change fee',
      OTHER: 'Other',
   }

   return (
      <div className="card p-4 flex flex-col gap-2">
         <div className="flex items-center gap-2 text-slate-500 text-xs">
            <AlertTriangle size={14} /> Penalties
         </div>

         <div className="text-2xl font-semibold">{totalUnpaid.toLocaleString('ru-RU')} ₸</div>
         <div className="text-xs text-slate-500">Unpaid penalties</div>

         {mostCommon && (
            <div className="flex items-center gap-2 text-xs mt-2">
               <TrendingDown size={14} className="text-amber-500" />
               Most common: <b>{pretty[mostCommon]}</b>
            </div>
         )}
      </div>
   )
}
