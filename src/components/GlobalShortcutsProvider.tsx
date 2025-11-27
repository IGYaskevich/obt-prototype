// @ts-nocheck
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalShortcutsProvider({ onToggleHelp }: { onToggleHelp: () => void }) {
   const nav = useNavigate()
   const isMac = navigator.platform.toUpperCase().includes('MAC')

   useEffect(() => {
      function handler(e: KeyboardEvent) {
         const key = e.key.toLowerCase()

         // игнорируем, если фокус в инпуте
         const target = (e.target as HTMLElement).tagName.toLowerCase()
         if (['input', 'textarea', 'select'].includes(target)) return

         // --- ОКНО ПОДСКАЗОК (HELP): Cmd+/ или Ctrl+Shift+/ ---
         if (isMac && e.metaKey && key === '/') {
            // macOS: ⌘ + /
            e.preventDefault()
            onToggleHelp()
            return
         }

         if (!isMac && e.ctrlKey && e.shiftKey && key === '/') {
            // Windows/Linux: Ctrl + Shift + /
            e.preventDefault()
            onToggleHelp()
            return
         }

         // --- NAVIGATION SHORTCUTS (G + key) ---
         if (key === 'g') {
            const onNext = (ev: KeyboardEvent) => {
               const next = ev.key.toLowerCase()

               if (next === 'd') nav('/dashboard')
               if (next === 's') nav('/search')
               if (next === 'e') nav('/employees')
               if (next === 'r') nav('/reports')
               if (next === 'c') nav('/settings/company')
               if (next === 't') nav('/tariffs')
               if (next === 'p') nav('/policies')
               if (next === 'h') nav('/support')
               if (next === 'u') nav('/documents')

               window.removeEventListener('keydown', onNext)
            }

            window.addEventListener('keydown', onNext)
         }
      }

      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
   }, [nav, onToggleHelp, isMac])

   return null
}
