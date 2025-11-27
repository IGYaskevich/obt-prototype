// @ts-nocheck
import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Plane, PieChart as PieIcon, Activity, TreePine, TrendingUp } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
   COMPLETED: '#22c55e',
   IN_PROGRESS: '#3b82f6',
   CANCELLED: '#ef4444',
   REFUNDED: '#f97316',
   NEEDS_APPROVAL: '#eab308',
}

const CO2_COLOR = '#22c55e'
const PRIMARY_COLOR = '#3b82f6'
const SECONDARY_COLOR = '#8b5cf6'

export default function AnalyticsPage() {
   // ---- MOCK SUMMARY / KPI ----
   const [summary] = useState({
      totalTrips: 124,
      totalEmployees: 37,
      totalAmount: 23450000,
      avgTripCost: 189000,
      co2ThisYear: 42.3, // тонн CO2
   })

   // ---- BOOKINGS BY STATUS ----
   const [bookingStatusData] = useState([
      { status: 'Completed', code: 'COMPLETED', count: 78 },
      { status: 'In progress', code: 'IN_PROGRESS', count: 14 },
      { status: 'Cancelled', code: 'CANCELLED', count: 9 },
      { status: 'Refunded', code: 'REFUNDED', count: 6 },
      { status: 'Needs approval', code: 'NEEDS_APPROVAL', count: 17 },
   ])

   // ---- BOOKINGS BY TYPE (авиа / ЖД / отель / пакет) ----
   const [bookingTypeData] = useState([
      { type: 'Flights', code: 'FLIGHT', count: 82 },
      { type: 'Rail', code: 'RAIL', count: 21 },
      { type: 'Hotels', code: 'HOTEL', count: 38 },
      { type: 'Packages', code: 'TRIP', count: 14 },
   ])

   // ---- TOP 5 ROUTES ----
   const [topRoutes] = useState([
      { route: 'Almaty → Astana', code: 'ALA-ASA', trips: 34, co2: 6.2 },
      { route: 'Astana → Almaty', code: 'ASA-ALA', trips: 29, co2: 5.9 },
      { route: 'Almaty → Shymkent', code: 'ALA-CIT', trips: 18, co2: 4.1 },
      { route: 'Almaty → Dubai', code: 'ALA-DXB', trips: 11, co2: 10.4 },
      { route: 'Almaty → Istanbul', code: 'ALA-IST', trips: 9, co2: 9.8 },
   ])

   // ---- TRIPS PER EMPLOYEE ----
   const [employeeTrips] = useState([
      { employee: 'Ignat Admin', trips: 19 },
      { employee: 'Maria Booker', trips: 14 },
      { employee: 'Alex Viewer', trips: 8 },
      { employee: 'Finance Team', trips: 21 },
      { employee: 'Sales Team', trips: 27 },
   ])

   // ---- AIRLINE RANKING ----
   const [airlines] = useState([
      { airline: 'Air Astana', flights: 54, avgRating: 4.6 },
      { airline: 'SCAT', flights: 23, avgRating: 4.0 },
      { airline: 'FlyArystan', flights: 18, avgRating: 4.2 },
      { airline: 'Turkish Airlines', flights: 9, avgRating: 4.8 },
      { airline: 'Emirates', flights: 6, avgRating: 4.9 },
   ])

   // ---- CO2 EMISSIONS OVER TIME ----
   const [co2Monthly] = useState([
      { month: 'Jan', co2: 2.8 },
      { month: 'Feb', co2: 3.1 },
      { month: 'Mar', co2: 3.5 },
      { month: 'Apr', co2: 3.9 },
      { month: 'May', co2: 4.2 },
      { month: 'Jun', co2: 4.6 },
      { month: 'Jul', co2: 4.8 },
      { month: 'Aug', co2: 4.5 },
      { month: 'Sep', co2: 3.9 },
      { month: 'Oct', co2: 3.4 },
      { month: 'Nov', co2: 2.7 },
      { month: 'Dec', co2: 2.4 },
   ])

   const totalBookings = bookingStatusData.reduce((acc, s) => acc + s.count, 0)

   return (
      <div className="space-y-6">
         <SectionHeader title="Analytics & Reports" subtitle="High-level analytics for trips, statuses, routes, employees and CO2 footprint." />

         {/* KPI CARDS */}
         <div className="grid md:grid-cols-4 gap-4">
            <KpiCard
               icon={<Plane size={18} className="text-brand-600" />}
               label="Total trips"
               value={summary.totalTrips.toString()}
               helper="Only completed and in-progress trips"
            />
            <KpiCard
               icon={<Activity size={18} className="text-emerald-600" />}
               label="Active employees"
               value={summary.totalEmployees.toString()}
               helper="Employees with at least 1 trip"
            />
            <KpiCard
               icon={<PieIcon size={18} className="text-violet-600" />}
               label="Total spend"
               value={`${summary.totalAmount.toLocaleString('ru-RU')} KZT`}
               helper={`Avg trip cost ~ ${summary.avgTripCost.toLocaleString('ru-RU')} KZT`}
            />
            <KpiCard
               icon={<TreePine size={18} className="text-emerald-700" />}
               label="CO₂ this year"
               value={`${summary.co2ThisYear.toFixed(1)} t`}
               helper="Based on estimated emissions per route"
            />
         </div>

         {/* ROW 1: BOOKING STATUS + STATUS BY TYPE */}
         <div className="grid lg:grid-cols-2 gap-4">
            {/* 1.1 BOOKINGS BY STATUS (PIE) */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Bookings by status</div>
                     <div className="text-xs text-slate-500">Distribution of orders by current status</div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                     Total: <span className="font-semibold">{totalBookings}</span>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={30} />
                        <Pie data={bookingStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                           {bookingStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.code] || PRIMARY_COLOR} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* 1.2 BOOKINGS BY TYPE (BAR) */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Bookings by type</div>
                     <div className="text-xs text-slate-500">Flights / Rail / Hotels / Trips</div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={bookingTypeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* ROW 2: TOP ROUTES + EMPLOYEE TRIPS */}
         <div className="grid lg:grid-cols-2 gap-4">
            {/* 2.1 TOP ROUTES */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Top 5 routes</div>
                     <div className="text-xs text-slate-500">Most frequent city pairs for your company</div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={topRoutes} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="code" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="trips" name="Trips" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="co2" name="CO₂ (t)" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">Маршруты вроде Almaty ↔ Astana можно подсвечивать в продукте как «быстрые направления» на Dashboard и в поиске.</p>
            </div>

            {/* 2.2 EMPLOYEE TRIPS */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Trips per employee / team</div>
                     <div className="text-xs text-slate-500">Who travels most inside the company</div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={employeeTrips} layout="vertical" margin={{ top: 10, right: 20, left: 50, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="employee" type="category" />
                        <Tooltip />
                        <Bar dataKey="trips" fill={PRIMARY_COLOR} radius={[0, 4, 4, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">Эти данные можно использовать в отчётах для HR/финансов: нагрузка по отделам, распределение командировок по ролям.</p>
            </div>
         </div>

         {/* ROW 3: AIRLINES + CO2 */}
         <div className="grid lg:grid-cols-2 gap-4">
            {/* 3.1 AIRLINE RANKING */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <TrendingUp size={16} className="text-brand-600" />
                     <div>
                        <div className="text-sm font-semibold text-slate-800">Airline ranking</div>
                        <div className="text-xs text-slate-500">Flights count and average rating within your company</div>
                     </div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={airlines} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="airline" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="flights" name="Flights" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="avgRating" name="Avg rating" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* 3.2 CO2 EMISSIONS OVER TIME */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <TreePine size={16} className="text-emerald-700" />
                     <div>
                        <div className="text-sm font-semibold text-slate-800">CO₂ emissions over year</div>
                        <div className="text-xs text-slate-500">Estimated CO₂ footprint by months (t)</div>
                     </div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={co2Monthly} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="co2" stroke={CO2_COLOR} strokeWidth={2} dot={{ r: 3 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">Позже сюда можно добавить цели по снижению CO₂ и таргеты для sustainability-отчётности.</p>
            </div>
         </div>
      </div>
   )
}

/* ------------ SMALL KPI CARD COMPONENT ------------ */

function KpiCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper?: string }) {
   return (
      <div className="card p-3 flex flex-col gap-1">
         <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="p-1.5 rounded-full bg-slate-50 border border-slate-200">{icon}</span>
         </div>
         <div className="text-lg font-semibold text-slate-900">{value}</div>
         {helper && <div className="text-[11px] text-slate-500">{helper}</div>}
      </div>
   )
}
