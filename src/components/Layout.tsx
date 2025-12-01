// @ts-nocheck
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import { BarChart2, FileCheck2, FileText, LayoutDashboard, LifeBuoy, LogOut, Search, Settings, Users } from 'lucide-react'
import { NotificationCenter } from './NotificationCenter.tsx'
import { QuickActionMenu } from './QuickActionMenu.tsx'

type Props = {
   children: React.ReactNode
}

export default function Layout({ children }: Props) {
   const { user, company, logout } = useStore()
   const nav = useNavigate()
   const [sidebarOpen, setSidebarOpen] = useState(false)

   const handleLogout = () => {
      logout()
      nav('/login')
   }

   const closeSidebar = () => setSidebarOpen(false)

   // ❗ НЕАВТОРИЗОВАННЫЙ ЮЗЕР — БЕЗ САЙДБАРА / ХЕДЕРА
   if (!user) {
      return (
         <div className="min-h-screen flex bg-slate-50 text-slate-900">
            <main className="flex-1 p-4 md:p-6 flex items-center justify-center">{children}</main>
         </div>
      )
   }

   // ✅ АВТОРИЗОВАННЫЙ — ПОЛНЫЙ LAYOUT
   return (
      <div className="min-h-screen flex bg-slate-50 text-slate-900">
         {/* SIDEBAR: desktop */}
         <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-200 bg-white">
            <div className="h-14 px-4 flex items-center border-b border-slate-100">
               <div className="font-semibold text-sm tracking-tight">Freedom Business Travel</div>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
               <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
               <NavItem to="/search" icon={Search} label="Поиск" />
               <NavItem to="/business-trips" icon={FileCheck2} label="Командировки" />
               <NavItem to="/employees" icon={Users} label="Сотрудники" />
               <NavItem to="/analytics" icon={BarChart2} label="Аналитика" />
               <NavItem to="/settings/company" icon={Settings} label="Настройки компании" />
               <NavItem to="/support" icon={LifeBuoy} label="Поддержка" />
               <NavItem to="/policies" icon={FileText} label="Политики" />
               <NavItem to="/penaltes" icon={FileText} label="Штрафы" />
            </nav>

            <div className="border-t border-slate-100 px-3 py-3 text-xs space-y-2">
               {company && (
                  <div className="flex flex-col gap-0.5">
                     <div className="font-semibold text-slate-700">{company.tariff} tariff</div>
                     <div className="text-slate-500">Balance: {company.balance.toLocaleString()} ₸</div>
                  </div>
               )}
               {user && (
                  <div className="flex items-center justify-between">
                     <div className="text-slate-500 truncate max-w-[160px]">{user.email}</div>
                     <button onClick={handleLogout} className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500">
                        <LogOut size={14} />
                        <span>Выйти</span>
                     </button>
                  </div>
               )}
            </div>
         </aside>

         {/* SIDEBAR: mobile (overlay) */}
         {sidebarOpen && (
            <>
               <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={closeSidebar} />
               <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-slate-200 bg-white md:hidden">
                  <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
                     <div className="font-semibold text-sm tracking-tight">OBT Prototype</div>
                     <button className="text-xs text-slate-500 hover:text-slate-800" onClick={closeSidebar}>
                        Закрыть
                     </button>
                  </div>

                  <nav className="flex-1 px-2 py-3 space-y-1 text-sm" onClick={closeSidebar}>
                     <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                     <NavItem to="/search" icon={Search} label="Поиск" />
                     <NavItem to="/business-trips" icon={FileCheck2} label="Командировки" />
                     <NavItem to="/employees" icon={Users} label="Сотрудники" />
                     <NavItem to="/analytics" icon={BarChart2} label="Аналитика" />
                     <NavItem to="/settings/company" icon={Settings} label="Настройки компании" />
                     <NavItem to="/support" icon={LifeBuoy} label="Поддержка" />
                     <NavItem to="/policies" icon={FileText} label="Политики" />
                     <NavItem to="/penaltes" icon={FileText} label="Штрафы" />
                  </nav>

                  <div className="border-t border-slate-100 px-3 py-3 text-xs space-y-2">
                     {company && (
                        <div className="flex flex-col gap-0.5">
                           <div className="font-semibold text-slate-700">{company.tariff} tariff</div>
                           <div className="text-slate-500">Balance: {company.balance.toLocaleString()} ₸</div>
                        </div>
                     )}
                     {user && (
                        <div className="flex items-center justify-between">
                           <div className="text-slate-500 truncate max-w-[160px]">{user.email}</div>
                           <button
                              onClick={() => {
                                 handleLogout()
                                 closeSidebar()
                              }}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500"
                           >
                              <LogOut size={14} />
                              <span>Выйти</span>
                           </button>
                        </div>
                     )}
                  </div>
               </aside>
            </>
         )}

         {/* MAIN AREA (авторизованный) */}
         <div className="flex-1 flex flex-col min-w-0">
            {/* TOP BAR */}
            <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur">
               <div className="flex items-center gap-3 min-w-0">
                  {/* burger only on mobile */}
                  <button
                     type="button"
                     className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                     onClick={() => setSidebarOpen(true)}
                  >
                     <span className="sr-only">Открыть меню</span>
                     <span className="flex flex-col gap-1">
                        <span className="block w-4 h-[2px] bg-slate-700 rounded" />
                        <span className="block w-4 h-[2px] bg-slate-700 rounded" />
                        <span className="block w-4 h-[2px] bg-slate-700 rounded" />
                     </span>
                  </button>

                  <div className="flex flex-col">
                     <span className="text-sm font-semibold text-slate-800 truncate">B2B Online Booking Tool</span>
                     <span className="text-[11px] text-slate-500 truncate">Управление командировками и закрывающими документами</span>
                  </div>
               </div>

               <div className="hidden md:flex items-center gap-4 text-xs">
                  <NotificationCenter />

                  {company && (
                     <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                           <span className="text-slate-500">Тариф:</span>
                           <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{company.tariff}</span>
                        </div>
                        <div className="text-slate-500">
                           Баланс: <span className="font-semibold">{company.balance.toLocaleString()} ₸</span>
                        </div>
                     </div>
                  )}
                  {user && (
                     <div className="flex flex-col items-end">
                        <span className="text-slate-700 text-xs">{user.email}</span>
                        <button onClick={handleLogout} className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-500">
                           <LogOut size={14} />
                           <span>Выйти</span>
                        </button>
                     </div>
                  )}
               </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
         </div>
      </div>
   )
}

type NavItemProps = {
   to: string
   icon: React.ComponentType<{ size?: number; className?: string }>
   label: string
}

function NavItem({ to, icon: Icon, label }: NavItemProps) {
   return (
      <NavLink
         to={to}
         className={({ isActive }) =>
            [
               'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
               'transition-colors text-xs',
               isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')
         }
      >
         <Icon size={16} className="shrink-0" />
         <span className="truncate">{label}</span>
      </NavLink>
   )
}
