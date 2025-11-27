import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import { Building2, Plane, ReceiptText, ShieldCheck, LifeBuoy, LogOut, ShoppingCart, Users } from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Building2 },
  { to: '/settings/company', label: 'Setting', icon: Users },
  { to: '/search', label: 'Search', icon: Plane },
  { to: '/policies', label: 'Policies', icon: ShieldCheck },
  { to: '/documents', label: 'Documents', icon: ReceiptText },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/reports', label: 'Reports', icon: Users },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, company, logout } = useStore()
  const navigate = useNavigate()

  if (!user || !company) return <>{children}</>

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="hidden md:flex flex-col bg-white border-r border-slate-100 p-4">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="h-9 w-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
            OBT
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{user.companyName}</div>
            <div className="text-xs text-slate-500">Tariff: {company.tariff}</div>
          </div>
        </Link>

        <nav className="mt-4 flex-1 space-y-1">
          {nav.map(n => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                    isActive ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 text-slate-700',
                  )
                }
              >
                <Icon size={16} />
                {n.label}
              </NavLink>
            )
          })}
        </nav>

        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="btn-ghost justify-start gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
          <div className="container-page h-14 flex items-center justify-between">
            <div className="md:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                OBT
              </div>
              <div className="text-sm font-semibold">OBT Prototype</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-brand">Tariff: {company.tariff}</span>
              <button onClick={() => navigate('/tariffs')} className="btn-ghost">
                Change tariff
              </button>
            </div>
          </div>
        </header>
        <main className="container-page py-6">{children}</main>
      </div>
    </div>
  )
}
