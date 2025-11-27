// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/store'
import { Search, Users, FileText, Compass, Settings, BarChart2, Folder, ArrowRight } from 'lucide-react'

export default function CommandPalette() {
   const nav = useNavigate()
   const { employees } = useStore()

   const [open, setOpen] = useState(false)
   const [query, setQuery] = useState('')
   const [results, setResults] = useState<any[]>([])
   const [cursor, setCursor] = useState(0)

   /* ----------------------------- HOTKEY: CMD+K ----------------------------- */
   const isMac = navigator.platform.toUpperCase().includes('MAC')

   useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
         const key = e.key.toLowerCase()

         // игнорируем ввод в инпутах
         const target = (e.target as HTMLElement).tagName.toLowerCase()
         if (['input', 'textarea', 'select'].includes(target)) return

         // macOS: ⌘ + K
         if (isMac && e.metaKey && key === 'k') {
            e.preventDefault()
            setOpen(o => !o)
            return
         }

         // Windows / Linux: Ctrl + Shift + K
         if (!isMac && e.ctrlKey && e.shiftKey && key === 'k') {
            e.preventDefault()
            setOpen(o => !o)
            return
         }
      }

      window.addEventListener('keydown', onKeyDown)
      return () => window.removeEventListener('keydown', onKeyDown)
   }, [])

   /* ---------------------------- SEARCH LOGIC ---------------------------- */

   const pages = [
      { type: 'page', title: 'Dashboard', icon: Compass, to: '/dashboard' },
      { type: 'page', title: 'Search', icon: Search, to: '/search' },
      { type: 'page', title: 'Employees', icon: Users, to: '/employees' },
      { type: 'page', title: 'Documents', icon: FileText, to: '/documents' },
      { type: 'page', title: 'Reports', icon: BarChart2, to: '/reports' },
      { type: 'page', title: 'Settings', icon: Settings, to: '/settings/company' },
      { type: 'page', title: 'Support', icon: Folder, to: '/support' },
   ]

   const documentsMock = [
      { id: 'DOC123', title: 'Invoice #DOC123', employee: 'Ignat Admin' },
      { id: 'DOC778', title: 'Act #DOC778', employee: 'Mariya Booker' },
   ]

   const cities = ['Almaty', 'Astana', 'Shymkent', 'Atyrau']

   function search(q: string) {
      if (!q.trim()) return []

      const lower = q.toLowerCase()

      const pageMatches = pages.filter(p => p.title.toLowerCase().includes(lower))

      const employeeMatches = employees
         .filter(e => e.name.toLowerCase().includes(lower) || e.email.toLowerCase().includes(lower) || (e.department || '').toLowerCase().includes(lower))
         .map(e => ({ type: 'employee', item: e }))

      const docMatches = documentsMock.filter(d => d.id.toLowerCase().includes(lower) || d.title.toLowerCase().includes(lower)).map(d => ({ type: 'document', item: d }))

      const cityMatches = cities.filter(c => c.toLowerCase().includes(lower)).map(c => ({ type: 'city', city: c }))

      // route detection: "almaty astana" or "a a"
      const routeMatches = []
      const parts = lower.split(' ')
      if (parts.length >= 2) {
         const from = capitalize(parts[0])
         const to = capitalize(parts[1])
         if (cities.includes(from) && cities.includes(to) && from !== to) {
            routeMatches.push({
               type: 'route',
               from,
               to,
            })
         }
      }

      return [...pageMatches.map(p => ({ type: 'page', item: p })), ...employeeMatches, ...docMatches, ...routeMatches, ...cityMatches]
   }

   useEffect(() => {
      setResults(search(query))
      setCursor(0)
   }, [query])

   /* ----------------------- ACTION ON ENTER ----------------------- */

   function runAction(result: any) {
      if (!result) return

      if (result.type === 'page') return nav(result.item.to)

      if (result.type === 'employee') return nav(`/employees/${result.item.id}`)

      if (result.type === 'document') return nav(`/documents?doc=${result.item.id}`)

      if (result.type === 'city') return nav(`/search?city=${result.city}`)

      if (result.type === 'route') return nav(`/search/results?from=${result.from}&to=${result.to}`)

      return null
   }

   /* ---------------------------- KEYBOARD NAVIGATION ---------------------------- */
   useEffect(() => {
      if (!open) return

      const handler = (e: KeyboardEvent) => {
         if (e.key === 'ArrowDown') {
            e.preventDefault()
            setCursor(c => Math.min(c + 1, results.length - 1))
         }
         if (e.key === 'ArrowUp') {
            e.preventDefault()
            setCursor(c => Math.max(c - 1, 0))
         }
         if (e.key === 'Enter') {
            runAction(results[cursor])
            setOpen(false)
         }
      }

      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
   }, [open, results, cursor])

   if (!open) return null

   /* ---------------------------- UI ---------------------------- */

   return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
         <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
               <Search size={16} className="text-slate-500" />
               <input
                  autoFocus
                  className="flex-1 text-sm outline-none"
                  placeholder="Поиск… (сотрудники, документы, страницы, маршруты)"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
               />
            </div>

            <div className="max-h-80 overflow-y-auto">
               {results.length === 0 && <div className="p-4 text-sm text-slate-500">Ничего не найдено</div>}

               {results.map((r, i) => (
                  <div
                     key={i}
                     onClick={() => {
                        runAction(r)
                        setOpen(false)
                     }}
                     className={`px-3 py-2 text-sm flex items-center gap-2 cursor-pointer ${i === cursor ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}
                  >
                     <SearchIconForResult r={r} />
                     <div className="flex-1">{renderLabel(r)}</div>
                     <ArrowRight size={14} className="text-slate-400" />
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}

/* ----------------------- HELPERS ----------------------- */

function SearchIconForResult({ r }) {
   const iconProps = { size: 16, className: 'text-slate-500' }

   if (r.type === 'page') return <r.item.icon {...iconProps} />
   if (r.type === 'employee') return <Users {...iconProps} />
   if (r.type === 'document') return <FileText {...iconProps} />
   if (r.type === 'route') return <Compass {...iconProps} />
   if (r.type === 'city') return <Compass {...iconProps} />
   return <Search {...iconProps} />
}

function renderLabel(r: any) {
   if (r.type === 'page') return r.item.title
   if (r.type === 'employee') return `${r.item.name} (${r.item.email})`
   if (r.type === 'document') return `${r.item.title}`
   if (r.type === 'route') return `${r.from} → ${r.to}`
   if (r.type === 'city') return r.city
   return 'Элемент'
}

function capitalize(s: string) {
   return s.charAt(0).toUpperCase() + s.slice(1)
}
