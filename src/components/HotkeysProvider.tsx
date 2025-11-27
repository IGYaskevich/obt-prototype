// @ts-nocheck
import { useEffect } from 'react'

export function HotkeysProvider({ toggleQuickActions }) {
   useEffect(() => {
      function onKey(e: KeyboardEvent) {
         const tag = (e.target as HTMLElement).tagName.toLowerCase()
         if (['input', 'textarea', 'select'].includes(tag)) return

         const key = e.key.toLowerCase()

         // Mac: Shift + A
         if (navigator.platform.includes('Mac')) {
            if (e.shiftKey && key === 'a') {
               e.preventDefault()
               toggleQuickActions()
            }
         }

         // Windows: Ctrl + Shift + A
         else {
            if (e.ctrlKey && e.shiftKey && key === 'a') {
               e.preventDefault()
               toggleQuickActions()
            }
         }

         // Esc → закрыть
         if (key === 'escape') toggleQuickActions(false)
      }

      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
   }, [toggleQuickActions])

   return null
}
