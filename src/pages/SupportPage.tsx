import React, { useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import {
  LifeBuoy,
  MessageCircle,
  Mail,
  PhoneCall,
  Clock,
  Zap,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

type IssueType = 'BOOKING' | 'PAYMENT' | 'DOCUMENTS' | 'POLICY' | 'TECH' | 'OTHER'

type Severity = 'LOW' | 'NORMAL' | 'HIGH'

export default function SupportPage() {
  const { company, user } = useStore()

  if (!company) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Support" subtitle="Company context is missing. Please log in again." />
        <div className="card p-4 text-sm text-red-600">Company is not available in current session.</div>
      </div>
    )
  }

  const supportLevel = useMemo(() => {
    switch (company.tariff) {
      case 'FREE':
        return {
          label: 'Basic support',
          description: 'FAQ + email only. No guaranteed response time.',
          badgeClass: 'bg-slate-50 border-slate-200 text-slate-700',
        }
      case 'POSTPAY':
        return {
          label: 'Standard SLA support',
          description: 'Email and ticket/chat support within business hours. Typical response: 2–4 hours.',
          badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
        }
      case 'FLEX':
      default:
        return {
          label: 'Priority 24/7 support',
          description: 'Priority chat, phone and WhatsApp 24/7. Typical response: under 15 minutes.',
          badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        }
    }
  }, [company.tariff])

  // -------- ISSUE FORM STATE --------

  const [issueType, setIssueType] = useState<IssueType>('BOOKING')
  const [severity, setSeverity] = useState<Severity>('NORMAL')
  const [description, setDescription] = useState('')

  const handleCreateTicket = () => {
    if (!description.trim()) {
      alert('Please briefly describe your issue so we can help.')
      return
    }

    const ticketId = `T-${Math.floor(Math.random() * 900000 + 100000)}`
    alert(
      [
        `Ticket created (simulated): ${ticketId}`,
        '',
        `Company: ${user?.companyName || 'Demo Company LLC'}`,
        `Requested by: ${user?.email || 'demo@company.com'}`,
        `Tariff: ${company.tariff}`,
        `Issue type: ${issueType}`,
        `Severity: ${severity}`,
        '',
        'In real product this would go to support backend / helpdesk system.',
      ].join('\n'),
    )

    setDescription('')
    setIssueType('BOOKING')
    setSeverity('NORMAL')
  }

  const isChatAvailable = company.tariff === 'POSTPAY' || company.tariff === 'FLEX'
  const isPhoneAvailable = company.tariff === 'FLEX'

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Support"
        subtitle="We help you resolve issues with bookings, payments, documents and policies."
      />

      {/* SUPPORT LEVEL SUMMARY */}
      <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start gap-2">
          <LifeBuoy size={18} className="mt-1 text-slate-600" />
          <div>
            <div className="font-semibold flex items-center gap-2">
              Current support level
              <span className={`px-2 py-0.5 rounded-full text-[10px] border ${supportLevel.badgeClass}`}>
                {company.tariff} • {supportLevel.label}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-1">{supportLevel.description}</div>
          </div>
        </div>
        <div className="text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-[11px]">Best way to reach us</div>
          {company.tariff === 'FREE' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Start with FAQ below.</li>
              <li>Then send us an email with detailed description.</li>
            </ul>
          )}
          {company.tariff === 'POSTPAY' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Create a ticket from this page for any issue.</li>
              <li>Use email for non-urgent questions.</li>
              <li>Chat is available during business hours.</li>
            </ul>
          )}
          {company.tariff === 'FLEX' && (
            <ul className="list-disc list-inside space-y-1">
              <li>For urgent flight issues — call us or use chat.</li>
              <li>For documents & invoicing — create a ticket or send email.</li>
              <li>We are available 24/7 for critical travel cases.</li>
            </ul>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-[2px] text-slate-400" />
          <span>
            This is a demo. All actions here (chat, WhatsApp, ticket creation) are simulated with alerts, but they mimic
            real B2B OBT support flows.
          </span>
        </div>
      </div>

      {/* QUICK CONTACTS */}
      <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
        {/* WhatsApp / Chat */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-slate-600" />
            <span className="font-semibold text-sm">Chat / WhatsApp</span>
          </div>
          <div className="text-slate-600">
            {isChatAvailable ? (
              <>
                <div>Use chat or WhatsApp for quick questions and urgent issues.</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="btn-primary h-8 px-3 text-[11px] flex items-center gap-1"
                    onClick={() =>
                      alert('Simulated: open in-app chat widget. In real product this would open chat panel.')
                    }
                  >
                    <MessageCircle size={12} />
                    Open chat
                  </button>
                  <button
                    className="btn-ghost h-8 px-3 text-[11px] flex items-center gap-1"
                    onClick={() => alert('Simulated: open WhatsApp link: https://wa.me/77001234567 (support number).')}
                  >
                    WhatsApp
                    <ExternalLink size={11} />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={11} />
                  <span>{company.tariff === 'FLEX' ? '24/7 for critical issues' : 'Business hours, local time'}</span>
                </div>
              </>
            ) : (
              <div className="text-[11px] text-slate-500">
                Chat and WhatsApp support are available for Postpay and Flex tariffs. For Free tariff, please use email
                and FAQ below.
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-slate-600" />
            <span className="font-semibold text-sm">Email</span>
          </div>
          <div className="text-slate-600">
            <div>Send us an email with full details (PNR, dates, passenger names, problem description).</div>
            <div className="mt-2">
              <span className="font-mono text-[12px] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                support@demo-obt.com
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Typical response:{' '}
              {company.tariff === 'FLEX'
                ? 'under 1 hour'
                : company.tariff === 'POSTPAY'
                  ? '2–4 hours (business days)'
                  : 'no guaranteed SLA'}
            </div>
          </div>
        </div>

        {/* Phone (Flex only) */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <PhoneCall size={16} className="text-slate-600" />
            <span className="font-semibold text-sm">Phone (for urgent travel)</span>
          </div>
          {isPhoneAvailable ? (
            <div className="text-slate-600">
              <div>Call us for urgent trip issues: denied boarding, cancellations, etc.</div>
              <div className="mt-2 font-mono text-[12px] bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
                +7 (700) 123 45 67
              </div>
              <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                <Zap size={11} className="text-emerald-500" />
                <span>Flex/VIP line, 24/7, priority queue.</span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500">
              Priority phone line is available for Flex tariff. On Free/Postpay, main contact channels are email and
              chat.
            </div>
          )}
        </div>
      </div>

      {/* ISSUE FORM: HELP ME SOLVE A PROBLEM */}
      <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
        {/* Left: form */}
        <div className="md:col-span-2 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <LifeBuoy size={16} className="text-slate-600" />
            <span className="font-semibold text-sm">Describe your issue</span>
          </div>

          {/* Type + severity */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500">Issue type</label>
              <select
                className="select mt-1 h-8 text-xs w-full"
                value={issueType}
                onChange={e => setIssueType(e.target.value as IssueType)}
              >
                <option value="BOOKING">Booking / ticket issue</option>
                <option value="PAYMENT">Payment / refund</option>
                <option value="DOCUMENTS">Documents / invoices</option>
                <option value="POLICY">Travel policy / restrictions</option>
                <option value="TECH">Technical problem / login</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500">Urgency</label>
              <select
                className="select mt-1 h-8 text-xs w-full"
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
              >
                <option value="LOW">Low — just a question</option>
                <option value="NORMAL">Normal — need help soon</option>
                <option value="HIGH">High — trip is today / tomorrow</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] text-slate-500">Short description (what happened, for which booking)</label>
            <textarea
              className="input mt-1 text-xs min-h-[90px]"
              placeholder="Example: Flight ALMATY–ASTANA, today 18:10, PNR ABC123. Ticket is not issued, payment passed, I see error on checkout..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60"
              onClick={handleCreateTicket}
              disabled={!description.trim()}
            >
              <LifeBuoy size={14} />
              Create ticket (simulate)
            </button>
          </div>
        </div>

        {/* Right: suggested next steps */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 text-xs">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-slate-600" />
            Suggested next steps
          </div>
          <SuggestedSteps issueType={issueType} severity={severity} tariff={company.tariff} />
        </div>
      </div>

      {/* FAQ */}
      <div className="card p-4 space-y-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-slate-600" />
          <span className="font-semibold text-sm">FAQ</span>
        </div>
        <FAQ tariff={company.tariff} />
      </div>
    </div>
  )
}

/* ===== SUGGESTED STEPS COMPONENT ===== */

function SuggestedSteps({
  issueType,
  severity,
  tariff,
}: {
  issueType: IssueType
  severity: Severity
  tariff: 'FREE' | 'POSTPAY' | 'FLEX'
}) {
  const items: string[] = []

  // базовая логика по типу
  switch (issueType) {
    case 'BOOKING':
      items.push(
        'Prepare booking details: route, dates, passenger names, PNR/booking ID.',
        'Check if you see ticket number / e-ticket in Documents or Orders page.',
      )
      break
    case 'PAYMENT':
      items.push(
        'Check if payment transaction is visible in your bank / PSP.',
        'Collect screenshots with payment status and any error messages.',
      )
      break
    case 'DOCUMENTS':
      items.push(
        'Open Documents page and check if invoice/act is already generated.',
        'Verify that payment was made with method that supports closing docs (not personal card).',
      )
      break
    case 'POLICY':
      items.push(
        'Note which option is blocked: route, airline, time, price.',
        'Compare with travel policy page — price limits and time windows may block this option.',
      )
      break
    case 'TECH':
      items.push(
        'Try to re-login and repeat the action in another browser.',
        'Take screenshots of the error and copy the exact error message if available.',
      )
      break
    case 'OTHER':
      items.push('Write what you want to achieve in “ideal world” in 1–2 sentences.')
      break
  }

  // логика по срочности
  if (severity === 'HIGH') {
    if (tariff === 'FLEX') {
      items.push(
        'For HIGH urgency on Flex, please use phone or chat immediately — then send details by email or ticket so we can track the case.',
      )
    } else if (tariff === 'POSTPAY') {
      items.push(
        'For HIGH urgency on Postpay, create ticket here and use chat/WhatsApp if available. Mark booking as urgent in the subject.',
      )
    } else {
      items.push(
        'For HIGH urgency on Free, send detailed email and use all available channels (email + WhatsApp if listed by your manager).',
      )
    }
  } else if (severity === 'NORMAL') {
    items.push('NORMAL urgency: creating a ticket from this page is usually enough.')
  } else {
    items.push('LOW urgency: check FAQ first, then send email or create a ticket if needed.')
  }

  return (
    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
      {items.map((x, idx) => (
        <li key={idx}>{x}</li>
      ))}
    </ul>
  )
}

/* ===== FAQ COMPONENT ===== */

const FAQ_ITEMS: {
  id: string
  q: string
  a: string
  tariffs?: Array<'FREE' | 'POSTPAY' | 'FLEX'>
}[] = [
  {
    id: 'ticket-not-issued',
    q: 'Оплата прошла, но билет не выписан. Что делать?',
    a: 'Сначала проверьте страницу заказов/документов: иногда билет выписывается с небольшой задержкой. Если через 10–15 минут билета нет, создайте тикет через форму выше и приложите скриншоты платежа и ошибки. Для Flex/Postpay можно также написать в чат.',
  },
  {
    id: 'no-docs-personal-card',
    q: 'Почему нет закрывающих документов при оплате личной картой?',
    a: 'Для личной карты в большинстве сценариев закрывающие документы не формируются автоматически. Если вашей компании критично получать документы, используйте оплату с баланса компании, корпкартой или по постоплате.',
  },
  {
    id: 'change-flight',
    q: 'Как изменить дату вылета по уже купленному билету?',
    a: 'В зависимости от тарифа авиабилета изменение может быть платным или недоступным. Для Flex-политики обычно разрешены более мягкие правила. Создайте тикет с номером бронирования и желаемыми новыми датами — мы вернёмся с расчётом доплат.',
  },
  {
    id: 'invoice-language',
    q: 'Можно ли получать инвойсы на английском?',
    a: 'Да, язык документов настраивается в Company Settings → Documents & Invoices. Выберите EN, после чего новые инвойсы будут формироваться на английском.',
  },
  {
    id: 'sla-free',
    q: 'Какие SLA по ответам на Free тарифе?',
    a: 'На Free тарифе нет гарантированного SLA. Мы стараемся отвечать на обращения как можно быстрее, но приоритет выше у Postpay и Flex клиентов.',
    tariffs: ['FREE'],
  },
  {
    id: 'sla-flex',
    q: 'Что даёт приоритетная поддержка Flex?',
    a: 'Для Flex-клиентов действует приоритетная линия: чат и телефон работают 24/7 для критичных ситуаций, среднее время ответа заметно ниже, чем на других тарифах.',
    tariffs: ['FLEX'],
  },
]

function FAQ({ tariff }: { tariff: 'FREE' | 'POSTPAY' | 'FLEX' }) {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null)

  const items = FAQ_ITEMS.filter(item => !item.tariffs || item.tariffs.includes(tariff))

  if (!items.length) {
    return <div className="text-xs text-slate-500">No FAQ items for this tariff in prototype.</div>
  }

  return (
    <div className="space-y-2 text-xs">
      {items.map(item => (
        <div key={item.id} className="border border-slate-200 rounded-md overflow-hidden bg-white">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => setOpenId(prev => (prev === item.id ? null : item.id))}
          >
            <span className="font-semibold text-[11px]">{item.q}</span>
            <span className="text-[11px] text-slate-400">{openId === item.id ? '−' : '+'}</span>
          </button>
          {openId === item.id && <div className="px-3 pb-3 text-[11px] text-slate-600">{item.a}</div>}
        </div>
      ))}
    </div>
  )
}
