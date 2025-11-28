// @ts-nocheck
import React, { useMemo, useState } from 'react'
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

type PeriodFilter = '30D' | '90D' | 'YEAR'

export default function AnalyticsPage() {
   // ---- PERIOD FILTER ----
   const [period, setPeriod] = useState<PeriodFilter>('YEAR')

   const periodFactor = useMemo(() => {
      switch (period) {
         case '30D':
            return 0.25 // условно «последний месяц»
         case '90D':
            return 0.6 // условно «последние 3 месяца»
         case 'YEAR':
         default:
            return 1
      }
   }, [period])

   // ---- MOCK SUMMARY / KPI (база за год) ----
   const [summary] = useState({
      totalTrips: 124,
      totalEmployees: 37,
      totalAmount: 23450000,
      avgTripCost: 189000,
      co2ThisYear: 42.3, // тонн CO2 за год
   })

   // summary с учётом выбранного периода
   const summaryForPeriod = useMemo(
      () => ({
         totalTrips: Math.round(summary.totalTrips * periodFactor),
         totalEmployees: summary.totalEmployees, // сотрудников обычно не режем по периоду
         totalAmount: Math.round(summary.totalAmount * periodFactor),
         avgTripCost: summary.avgTripCost, // средний чек считаем неизменным
         co2ThisYear: +(summary.co2ThisYear * periodFactor).toFixed(1),
      }),
      [summary, periodFactor],
   )

   // ---- BOOKINGS BY STATUS ----
   const [bookingStatusData] = useState([
      { status: 'Completed', code: 'COMPLETED', count: 78 },
      { status: 'In progress', code: 'IN_PROGRESS', count: 14 },
      { status: 'Cancelled', code: 'CANCELLED', count: 9 },
      { status: 'Refunded', code: 'REFUNDED', count: 6 },
      { status: 'Needs approval', code: 'NEEDS_APPROVAL', count: 17 },
   ])

   const totalBookingsAllTime = bookingStatusData.reduce((acc, s) => acc + s.count, 0)
   const totalBookingsForPeriod = Math.round(totalBookingsAllTime * periodFactor)

   // ---- BOOKINGS BY TYPE (авиа / ЖД / отель / пакет) ----
   const [bookingTypeData] = useState([
      { type: 'Flights', code: 'FLIGHT', count: 82 },
      { type: 'Rail', code: 'RAIL', count: 21 },
      { type: 'Hotels', code: 'HOTEL', count: 38 },
      { type: 'Packages', code: 'TRIP', count: 14 },
   ])

   // ---- SEGMENT (Economy / Business / First/Other) ----
   const [cabinSegmentData] = useState([
      { segment: 'Economy', code: 'ECONOMY', trips: 96, amount: 14500000 },
      { segment: 'Business', code: 'BUSINESS', trips: 22, amount: 7200000 },
      { segment: 'First / Other', code: 'FIRST', trips: 6, amount: 1750000 },
   ])

   // ---- DOMESTIC vs INTERNATIONAL ----
   const [geoSplitData] = useState([
      { category: 'Domestic', code: 'DOMESTIC', trips: 87, amount: 13400000 },
      { category: 'International', code: 'INTERNATIONAL', trips: 37, amount: 10050000 },
   ])

   // ---- TOP 5 ROUTES ----
   const [topRoutes] = useState([
      { route: 'Almaty → Astana', code: 'ALA-ASA', trips: 34, co2: 6.2, domestic: true },
      { route: 'Astana → Almaty', code: 'ASA-ALA', trips: 29, co2: 5.9, domestic: true },
      { route: 'Almaty → Shymkent', code: 'ALA-CIT', trips: 18, co2: 4.1, domestic: true },
      { route: 'Almaty → Dubai', code: 'ALA-DXB', trips: 11, co2: 10.4, domestic: false },
      { route: 'Almaty → Istanbul', code: 'ALA-IST', trips: 9, co2: 9.8, domestic: false },
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

   // ---- CO2 EMISSIONS OVER TIME (по месяцам года) ----
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

   const co2ForPeriod = useMemo(() => {
      if (period === 'YEAR') return co2Monthly
      if (period === '90D') return co2Monthly.slice(-3) // последние 3 месяца
      if (period === '30D') return co2Monthly.slice(-1) // последний месяц
      return co2Monthly
   }, [period, co2Monthly])

   return (
      <div className="space-y-6">
         <SectionHeader title="Analytics & Reports" subtitle="High-level analytics for trips, segments, routes, geographies and CO₂ footprint." />

         {/* PERIOD FILTER */}
         <div className="card p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div className="text-slate-600">
               <div className="font-medium text-sm">Analytics period</div>
               <div className="text-[11px] text-slate-500">Change the time window for KPIs and CO₂ chart (demo logic).</div>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 gap-1">
               <PeriodChip label="Last 30 days" active={period === '30D'} onClick={() => setPeriod('30D')} />
               <PeriodChip label="Last 3 months" active={period === '90D'} onClick={() => setPeriod('90D')} />
               <PeriodChip label="Full year" active={period === 'YEAR'} onClick={() => setPeriod('YEAR')} />
            </div>
         </div>

         {/* KPI CARDS */}
         <div className="grid md:grid-cols-4 gap-4">
            <KpiCard
               icon={<Plane size={18} className="text-brand-600" />}
               label="Trips in period"
               value={summaryForPeriod.totalTrips.toString()}
               helper={`Period: ${period === '30D' ? 'last 30 days' : period === '90D' ? 'last 3 months' : 'full year'}`}
            />
            <KpiCard
               icon={<Activity size={18} className="text-emerald-600" />}
               label="Active employees"
               value={summaryForPeriod.totalEmployees.toString()}
               helper="At least 1 trip in the period"
            />
            <KpiCard
               icon={<PieIcon size={18} className="text-violet-600" />}
               label="Total spend"
               value={`${summaryForPeriod.totalAmount.toLocaleString('ru-RU')} KZT`}
               helper={`Avg trip cost ~ ${summaryForPeriod.avgTripCost.toLocaleString('ru-RU')} KZT`}
            />
            <KpiCard
               icon={<TreePine size={18} className="text-emerald-700" />}
               label="CO₂ in period"
               value={`${summaryForPeriod.co2ThisYear.toFixed(1)} t`}
               helper="Based on estimated emissions per route"
            />
         </div>

         {/* ROW 1: BOOKING STATUS + TYPE */}
         <div className="grid lg:grid-cols-2 gap-4">
            {/* 1.1 BOOKINGS BY STATUS (PIE) */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Bookings by status</div>
                     <div className="text-xs text-slate-500">Distribution by status (all time, numbers scaled by period in KPIs)</div>
                  </div>
                  <div className="text-[11px] text-slate-500 text-right">
                     All time: <span className="font-semibold">{totalBookingsAllTime}</span>
                     <br />
                     Approx. in period: <span className="font-semibold">{totalBookingsForPeriod}</span>
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
                     <div className="text-xs text-slate-500">Flights / Rail / Hotels / Packages</div>
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
                     <div className="text-xs text-slate-500">Most frequent city pairs; combination of domestic and international</div>
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
               <p className="mt-2 text-[11px] text-slate-500">
                  Внутренние маршруты (ALA-ASA, ASA-ALA, ALA-CIT) и международные (ALA-DXB, ALA-IST). Можно использовать как подсказки быстрых направлений.
               </p>
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
               <p className="mt-2 text-[11px] text-slate-500">Можно строить отчёты по отделам и ролям: кто чаще всего летает, какая нагрузка на команду.</p>
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
                        <div className="text-xs text-slate-500">Flights count and average rating</div>
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
                        <div className="text-sm font-semibold text-slate-800">CO₂ emissions</div>
                        <div className="text-xs text-slate-500">Estimated CO₂ footprint by months (filtered by period)</div>
                     </div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={co2ForPeriod} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="co2" stroke={CO2_COLOR} strokeWidth={2} dot={{ r: 3 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">Период влияет на набор месяцев (30 дней — последний месяц, 3 месяца — последние три, год — все месяцы).</p>
            </div>
         </div>

         {/* ROW 4: SEGMENT (CABIN) + DOMESTIC vs INTERNATIONAL */}
         <div className="grid lg:grid-cols-2 gap-4">
            {/* 4.1 CABIN SEGMENT */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Trips by cabin class</div>
                     <div className="text-xs text-slate-500">Economy / Business / First & other</div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={cabinSegmentData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="segment" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="trips" name="Trips" fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="amount" name="Spend (KZT)" fill={SECONDARY_COLOR} radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">Здесь видно долю бизнес-класса в стоимости и количестве поездок — удобно для контроля политики по сегментам.</p>
            </div>

            {/* 4.2 DOMESTIC vs INTERNATIONAL */}
            <div className="card p-4">
               <div className="flex items-center justify-between mb-2">
                  <div>
                     <div className="text-sm font-semibold text-slate-800">Domestic vs international trips</div>
                     <div className="text-xs text-slate-500">Share of internal vs abroad business travel</div>
                  </div>
               </div>
               <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={30} />
                        <Pie data={geoSplitData} dataKey="trips" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                           {geoSplitData.map((entry, index) => (
                              <Cell key={`geo-${index}`} fill={index === 0 ? PRIMARY_COLOR : SECONDARY_COLOR} />
                           ))}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <p className="mt-2 text-[11px] text-slate-500">
                  Можно отдельно считать бюджет и CO₂ по внутренним и зарубежным командировкам — важно для отчётности и travel-политик.
               </p>
            </div>
         </div>
      </div>
   )
}

/* ------------ SMALL COMPONENTS ------------ */

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

function PeriodChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={
            'px-3 py-1 rounded-full text-[11px] border transition ' +
            (active ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200')
         }
      >
         {label}
      </button>
   )
}
