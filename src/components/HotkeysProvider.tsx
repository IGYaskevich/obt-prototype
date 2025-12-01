// @ts-nocheck
import { useEffect } from 'react'

export function HotkeysProvider({ toggleQuickActions }) {
   useEffect(() => {
      function onKey(e: KeyboardEvent) {
         const target = e.target as HTMLElement
         const tag = target.tagName.toLowerCase()
         if (['input', 'textarea', 'select'].includes(tag) || target.isContentEditable) return

         const key = e.key.toLowerCase()
         const isMac = navigator.platform.toUpperCase().includes('MAC')

         // чтобы не дёргалось при удержании клавиш
         if (e.repeat) return

         // Mac: Shift + A
         if (isMac) {
            if (e.shiftKey && key === 'a') {
               e.preventDefault()
               toggleQuickActions() // toggle
               return
            }
         } else {
            // Windows: Ctrl + Shift + A
            if (e.ctrlKey && e.shiftKey && key === 'a') {
               e.preventDefault()
               toggleQuickActions() // toggle
               return
            }
         }

         // Esc → всегда закрыть
         if (key === 'escape') {
            toggleQuickActions(false) // тут уже реально "close"
         }
      }

      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
   }, [toggleQuickActions])

   return null
}
