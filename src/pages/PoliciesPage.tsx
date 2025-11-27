import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { Shield, Info, Clock, Plane, Check, Ban } from 'lucide-react'

export default function TravelPolicyPage() {
   const { travelPolicy } = useStore()

   const { softLimit, blockLimit, preferredFrom, preferredTo, allowedClasses, allowConnections, maxConnectionTime, handBaggageOnly } = travelPolicy

   return (
      <div className="space-y-6">
         <SectionHeader title="Travel policy" subtitle="Read-only view of current company travel rules used in search and booking flows." />

         {/* SUMMARY */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
               <Shield size={18} className="mt-1 text-slate-600" />
               <div>
                  <div className="font-semibold">Overview</div>
                  <div className="text-xs text-slate-600 mt-1">
                     These rules are configured by admin in Company Settings. Coordinators see their effect in search results and booking flows as OK / WARN / BLOCK flags.
                  </div>
               </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
               <div className="font-semibold text-[11px]">Price logic</div>
               <ul className="list-disc list-inside space-y-1">
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="emerald" /> OK:
                     </span>{' '}
                     below {softLimit.toLocaleString('ru-RU')} KZT
                  </li>
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="amber" /> WARN:
                     </span>{' '}
                     {softLimit.toLocaleString('ru-RU')} – {blockLimit.toLocaleString('ru-RU')} KZT
                  </li>
                  <li>
                     <span className="inline-flex items-center gap-1">
                        <Dot color="red" /> BLOCK:
                     </span>{' '}
                     above {blockLimit.toLocaleString('ru-RU')} KZT
                  </li>
               </ul>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
               <div className="font-semibold text-[11px]">Schedule & classes</div>
               <ul className="list-disc list-inside space-y-1">
                  <li>
                     Preferred departure time: {preferredFrom}–{preferredTo}
                  </li>
                  <li>Allowed classes: {allowedClasses.join(', ') || '—'}</li>
                  <li>
                     Connections: {allowConnections ? 'Allowed' : 'Forbidden'}
                     {allowConnections && ` • max ${maxConnectionTime} min`}
                  </li>
               </ul>
            </div>
         </div>

         {/* FLIGHT PRICE RULES */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
               <Plane size={16} className="text-slate-600" />
               <span className="font-semibold">Flight price rules</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
               <InfoBlock
                  title="Soft limit (WARN threshold)"
                  value={`${softLimit.toLocaleString('ru-RU')} KZT`}
                  description="Above this price tickets are still bookable, but marked as WARN."
               />
               <InfoBlock
                  title="Block limit"
                  value={`${blockLimit.toLocaleString('ru-RU')} KZT`}
                  description="Above this price tickets are highlighted as BLOCK and cannot be purchased."
               />
               <div className="flex items-start gap-2 text-[11px] text-slate-600">
                  <Info size={14} className="mt-[2px]" />
                  <span>
                     These thresholds are applied per one-way flight. For round trips, system evaluates segment prices separately or combined (depending on configuration).
                  </span>
               </div>
            </div>
         </div>

         {/* TIME WINDOW */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
               <Clock size={16} className="text-slate-600" />
               <span className="font-semibold">Preferred departure time window</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
               <InfoBlock
                  title="Preferred window"
                  value={`${preferredFrom} – ${preferredTo}`}
                  description="Flights outside this window are marked as WARN due to schedule mismatch."
               />
               <div className="text-[11px] text-slate-600 md:col-span-2">
                  This helps steer employees towards business-friendly departure times (e.g. avoid night flights) without fully blocking out-of-window options.
               </div>
            </div>
         </div>

         {/* ALLOWED CLASSES & EXTRA RULES */}
         <div className="card p-4 grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <Check size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Allowed flight classes</span>
               </div>
               <div className="text-xs text-slate-600">
                  {allowedClasses.length ? (
                     <ul className="list-disc list-inside space-y-1">
                        {allowedClasses.map(c => (
                           <li key={c}>{c.replace('_', ' ')}</li>
                        ))}
                     </ul>
                  ) : (
                     <span>No classes explicitly allowed. In real setup this would block all flights.</span>
                  )}
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <Ban size={16} className="text-slate-600" />
                  <span className="font-semibold text-sm">Additional rules</span>
               </div>
               <div className="text-xs text-slate-600 space-y-1">
                  <div>
                     Connections: <strong>{allowConnections ? 'Allowed' : 'Forbidden'}</strong>
                     {allowConnections && ` (max ${maxConnectionTime} minutes per connection)`}
                  </div>
                  <div>
                     Hand baggage only: <strong>{handBaggageOnly ? 'Required' : 'Not required'}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                     These rules are applied on top of price and time logic and are reflected in flight badges and detailed tooltips in search results.
                  </div>
               </div>
            </div>
         </div>

         {/* LEGEND */}
         <div className="card p-4 space-y-3 text-sm">
            <div className="font-semibold">How flags are shown in search & booking</div>
            <div className="flex flex-col md:flex-row gap-3 text-xs">
               <LegendItem color="bg-emerald-100 border-emerald-400" title="OK" text="Ticket fully fits policy by price, time window and class. Green badge in search results." />
               <LegendItem
                  color="bg-amber-100 border-amber-400"
                  title="WARN"
                  text="Ticket is allowed but violates soft price limit or preferred time window. Yellow badge with hint."
               />
               <LegendItem
                  color="bg-red-100 border-red-400"
                  title="BLOCK"
                  text="Ticket violates hard block limit or forbidden class. Shown as blocked option; user cannot complete purchase."
               />
            </div>
         </div>
      </div>
   )
}

/* SMALL PRESENTATIONAL COMPONENTS */

function InfoBlock({ title, value, description }: { title: string; value: string; description: string }) {
   return (
      <div className="text-xs text-slate-600 space-y-1">
         <div className="font-semibold text-[11px]">{title}</div>
         <div className="text-[13px] font-medium">{value}</div>
         <div className="text-[11px] text-slate-500">{description}</div>
      </div>
   )
}

function Dot({ color }: { color: 'emerald' | 'amber' | 'red' }) {
   const cls = color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-red-500'
   return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
}

function LegendItem({ color, title, text }: { color: string; title: string; text: string }) {
   return (
      <div className="flex items-start gap-2">
         <div className={`h-5 w-5 rounded border ${color}`} />
         <div>
            <div className="font-semibold text-[11px] mb-0.5">{title}</div>
            <div className="text-[11px] text-slate-600">{text}</div>
         </div>
      </div>
   )
}
