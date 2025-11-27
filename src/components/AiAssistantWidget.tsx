import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MessageCircle, Send, Sparkles, X } from 'lucide-react'

type ChatMessage = { role: 'user' | 'assistant'; text: string }

export function AiAssistantWidget() {
   const nav = useNavigate()
   const [isOpen, setIsOpen] = useState(false)
   const [messages, setMessages] = useState<ChatMessage[]>([
      {
         role: 'assistant',
         text: 'Привет! Опиши простыми словами, что нужно: «Завтра билет в Астану», «Отель в Астане на выходные» и т.д.',
      },
   ])

   const [input, setInput] = useState('')
   const [parsed, setParsed] = useState<ParsedIntent | null>(null)

   const toggleOpen = () => setIsOpen(o => !o)

   const sendMessage = () => {
      if (!input.trim()) return

      const userText = input.trim()
      setMessages(prev => [...prev, { role: 'user', text: userText }])
      setInput('')

      const intent = parseIntent(userText)
      setParsed(intent)

      const reply = buildAssistantReply(intent)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
   }

   const goToResults = () => {
      if (!parsed) return

      const params = new URLSearchParams({
         type: parsed.type,
         from: parsed.from || 'Almaty',
         to: parsed.to || 'Astana',
         date: parsed.date,
         pax: String(parsed.pax || 1),
      })

      nav(`/search/results?${params.toString()}`)
      setIsOpen(false)
   }

   return (
      <>
         {/* floating magic button */}
         <div className="fixed bottom-4 right-4 z-40">
            <div className="relative">
               {/* ВНЕШНЕЕ ЯРКОЕ СВЕЧЕНИЕ */}
               <div className="pointer-events-none absolute -inset-4 rounded-full bg-brand-500/55 blur-2xl animate-pulse" />
               <div className="pointer-events-none absolute -inset-7 rounded-full bg-brand-400/50 blur-3xl animate-glow" />

               {/* КНОПКА */}
               <button
                  type="button"
                  onClick={toggleOpen}
                  className="
              relative rounded-full shadow-2xl
              bg-brand-600 hover:bg-brand-700 text-white
              px-5 py-2.5 flex items-center gap-2 text-sm font-semibold
              transition-all duration-300
              hover:shadow-brand-500/70 hover:shadow-[0_0_35px_rgba(59,130,246,0.9)]
              hover:-translate-y-0.5 active:scale-95
            "
               >
                  {/* внутренний soft-glow по кнопке */}
                  <span className="absolute inset-0 rounded-full bg-brand-300/40 blur-md opacity-70 mix-blend-screen" />

                  <div className="relative z-10 flex items-center gap-2">
                     <MessageCircle size={18} className="drop-shadow-md" />
                     <span>AI помощник</span>
                  </div>
               </button>
            </div>
         </div>

         {/* chat panel */}
         {isOpen && (
            <div className="fixed bottom-16 right-4 z-40 w-80 h-96 card flex flex-col shadow-xl border border-slate-200 bg-white">
               {/* header */}
               <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                     <Sparkles className="text-brand-500" size={16} />
                     <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">AI Travel Assistant</span>
                        <span className="text-[10px] text-slate-500">Опиши задачу — я соберу поиск автоматически</span>
                     </div>
                  </div>
                  <button className="p-1 rounded-full hover:bg-slate-100" onClick={() => setIsOpen(false)}>
                     <X size={14} className="text-slate-500" />
                  </button>
               </div>

               {/* messages */}
               <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2 text-xs">
                  {messages.map((m, idx) => (
                     <div key={idx} className={`max-w-[85%] px-3 py-2 rounded-xl ${m.role === 'user' ? 'ml-auto bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700'}`}>
                        {m.text}
                     </div>
                  ))}
               </div>

               {/* intent preview */}
               {parsed && (
                  <div className="px-3 py-2 border-t border-slate-100 text-[11px] space-y-2 bg-brand-50/80">
                     <div className="text-slate-700 font-semibold">Понял запрос, собрал параметры:</div>
                     <ul className="text-slate-600 space-y-0.5">
                        <li>Тип: {humanType(parsed.type)}</li>
                        <li>
                           Маршрут: {parsed.from} → {parsed.to}
                        </li>
                        <li>Дата: {parsed.date}</li>
                        <li>Пассажиров: {parsed.pax}</li>
                     </ul>
                     <button className="btn-primary w-full flex items-center justify-center gap-1 text-[11px]" onClick={goToResults}>
                        Перейти к выдаче
                        <ArrowRight size={13} />
                     </button>
                  </div>
               )}

               {/* input */}
               <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-2">
                  <input
                     className="input flex-1 text-xs"
                     placeholder='Например: "Билет завтра в Астану"'
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn-primary px-3 py-1.5 flex items-center gap-1 text-[11px]" onClick={sendMessage}>
                     <Send size={13} />
                     Отправить
                  </button>
               </div>
            </div>
         )}
      </>
   )
}

/* -------------------------------------------------------------------------- */
/*                                INTENT PARSER                               */
/* -------------------------------------------------------------------------- */

type TravelType = 'avia' | 'rail' | 'hotel' | 'transfer'

type ParsedIntent = {
   type: TravelType
   from: string
   to: string
   date: string
   pax: number
}

function humanType(type: TravelType) {
   if (type === 'avia') return 'Авиабилет'
   if (type === 'rail') return 'ЖД билет'
   if (type === 'hotel') return 'Отель'
   return 'Трансфер'
}

function parseIntent(text: string): ParsedIntent {
   const lower = text.toLowerCase()

   // тип услуги
   const type: TravelType = lower.includes('поезд') || lower.includes('жд') ? 'rail' : lower.includes('отель') ? 'hotel' : lower.includes('трансфер') ? 'transfer' : 'avia'

   // пассажиры
   let pax = 1
   const paxMatch = lower.match(/(?:на|для)\s(\d+)/)
   if (paxMatch) pax = Number(paxMatch[1]) || 1

   if (lower.includes('на двоих')) pax = 2
   if (lower.includes('на троих')) pax = 3

   // to
   let to = 'Astana'
   const toMatch = lower.match(/в\s([а-яa-z]+)/i)
   if (toMatch) to = capitalize(toMatch[1])

   // from (по умолчанию Almaty)
   const from = 'Almaty'

   // date
   const date = detectDate(lower)

   return { type, from, to, date, pax }
}

function detectDate(text: string) {
   const today = new Date()

   if (text.includes('завтра')) {
      const d = new Date()
      d.setDate(today.getDate() + 1)
      return d.toISOString().slice(0, 10)
   }

   if (text.includes('послезавтра')) {
      const d = new Date()
      d.setDate(today.getDate() + 2)
      return d.toISOString().slice(0, 10)
   }

   if (text.includes('на выходных')) {
      const d = new Date()
      d.setDate(today.getDate() + 5)
      return d.toISOString().slice(0, 10)
   }

   const dateRegex = /(\d{1,2})\s(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/
   const m = text.match(dateRegex)

   if (m) {
      const day = Number(m[1])
      const month = monthNumber(m[2])
      const year = today.getFullYear()
      // @ts-ignore
      return new Date(year, month - 1, day).toISOString().slice(0, 10)
   }

   const fallback = new Date()
   fallback.setDate(today.getDate() + 3)
   return fallback.toISOString().slice(0, 10)
}

function monthNumber(name: string) {
   return {
      января: 1,
      февраля: 2,
      марта: 3,
      апреля: 4,
      мая: 5,
      июня: 6,
      июля: 7,
      августа: 8,
      сентября: 9,
      октября: 10,
      ноября: 11,
      декабря: 12,
   }[name]
}

function capitalize(s: string) {
   return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function buildAssistantReply(parsed: ParsedIntent): string {
   return [
      'Понял запрос:',
      '',
      `• ${humanType(parsed.type)}`,
      `• Маршрут: ${parsed.from} → ${parsed.to}`,
      `• Дата: ${parsed.date}`,
      `• Пассажиров: ${parsed.pax}`,
      '',
      'Нажми «Перейти к выдаче», чтобы посмотреть варианты.',
   ].join('\n')
}
