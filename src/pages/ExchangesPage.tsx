import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'

export default function ExchangesPage() {
   const { company } = useStore()
   const [mode, setMode] = useState<'cancel' | 'change'>('change')

   const allowed = company?.tariff === 'FLEX' || company?.tariff === 'POSTPAY'

   return (
      <div className="space-y-5">
         <SectionHeader title="Exchanges / returns" subtitle="Enabled for Flex, partially for Postpay" />

         {!allowed && <div className="card p-4 border-amber-200 bg-amber-50/30 text-sm text-amber-800">Not available on Free tariff.</div>}

         {allowed && (
            <>
               <div className="card p-4">
                  <div className="text-sm font-medium">Select action</div>
                  <div className="flex gap-2 mt-2">
                     <button className={mode === 'change' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('change')}>
                        Change dates
                     </button>
                     <button className={mode === 'cancel' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('cancel')}>
                        Cancel ticket
                     </button>
                  </div>
               </div>

               <div className="card p-4 space-y-2">
                  {mode === 'change' && (
                     <>
                        <div className="text-sm font-medium">New date</div>
                        <input type="date" className="input" defaultValue="2025-12-03" />
                        <div className="text-xs text-slate-500">Recalculation: +8 000 ₸ (mock)</div>
                        <button className="btn-primary mt-2">Confirm change</button>
                     </>
                  )}
                  {mode === 'cancel' && (
                     <>
                        <div className="text-sm font-medium">Refund terms</div>
                        <div className="text-sm text-slate-600">Penalty 10% (mock). Remaining goes to original payment method.</div>
                        <button className="btn-primary mt-2">Confirm cancellation</button>
                     </>
                  )}
               </div>
            </>
         )}
      </div>
   )
}
