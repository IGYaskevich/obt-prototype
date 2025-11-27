import React from 'react'
import SectionHeader from '../components/SectionHeader'
import { Tariff, useStore } from '../state/store'
import clsx from 'clsx'

type Feature = {
  id: string
  title: string
  free: boolean | 'limited'
  postpay: boolean | 'limited'
  flex: boolean | 'limited'
  note?: string
}

const features: Feature[] = [
  {
    id: 'fast_buy',
    title: 'Быстрая покупка за 1–2 шага',
    free: true,
    postpay: true,
    flex: true,
  },
  {
    id: 'trip_basket',
    title: 'Сбор командировки (корзина услуг)',
    free: true,
    postpay: true,
    flex: true,
  },
  {
    id: 'policies',
    title: 'Тревел-политики и ограничения',
    free: 'limited',
    postpay: true,
    flex: true,
    note: 'В Free — только подсветка, без обязательных согласований.',
  },
  {
    id: 'approvals',
    title: 'Согласования (approval flow)',
    free: false,
    postpay: true,
    flex: true,
    note: 'Включаются при Out of Policy.',
  },
  {
    id: 'postpay',
    title: 'Отсрочка платежа',
    free: false,
    postpay: true,
    flex: true,
    note: 'Для Flex — как расширение Postpay.',
  },
  {
    id: 'limits',
    title: 'Лимиты и подсказки сроков оплаты',
    free: false,
    postpay: true,
    flex: true,
  },
  {
    id: 'service_fee',
    title: 'Сервисный сбор',
    free: false,
    postpay: true,
    flex: true,
    note: 'Postpay ~7%, Flex ~4% (мок).',
  },
  {
    id: 'support',
    title: 'Поддержка',
    free: 'limited',
    postpay: 'limited',
    flex: true,
    note: 'Free — FAQ, Postpay — чат/тикеты, Flex — 24/7.',
  },
  {
    id: 'exchanges',
    title: 'Обмены / возвраты',
    free: false,
    postpay: 'limited',
    flex: true,
    note: 'Postpay — частично, Flex — без ограничений.',
  },
  {
    id: 'api',
    title: 'API-интеграции / расширения',
    free: false,
    postpay: false,
    flex: true,
  },
  {
    id: 'docs',
    title: 'Онлайн закрывающие документы',
    free: 'limited',
    postpay: true,
    flex: true,
    note: 'В Free доступны только при оплате компания-методами (мок).',
  },
]

const tariffCards: {
  id: Tariff
  title: string
  subtitle: string
  bullets: string[]
  accentCls: string
}[] = [
  {
    id: 'FREE',
    title: 'Free',
    subtitle: 'Для разовых покупок и малого бизнеса',
    bullets: ['Покупка билета в 1–2 шага', 'Только личная карта', 'Без поддержки', 'Минимальные политики (подсветка)'],
    accentCls: 'border-slate-200',
  },
  {
    id: 'POSTPAY',
    title: 'Postpay',
    subtitle: 'Для компаний с регулярными поездками',
    bullets: [
      'Отсрочка платежа',
      'Лимиты постоплаты',
      'Подсказки сроков оплаты',
      'Сервисный сбор ~7%',
      'Поддержка через чат/тикеты',
    ],
    accentCls: 'border-brand-200',
  },
  {
    id: 'FLEX',
    title: 'Flex / VIP',
    subtitle: 'Для крупного бизнеса и travel-команд',
    bullets: [
      '24/7 приоритетная поддержка',
      'Любые обмены/возвраты',
      'VIP-карточки и флоу',
      'API-интеграции',
      'Сервисный сбор ~4%',
    ],
    accentCls: 'border-emerald-200',
  },
]

export default function TariffsPage() {
  const { company, setTariff } = useStore()
  if (!company) return null

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Тарифы и возможности"
        subtitle="Сравнение Free / Postpay / Flex и их поведения в продукте"
      />

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {tariffCards.map(c => {
          const active = company.tariff === c.id
          return (
            <div key={c.id} className={clsx('card p-4 border', c.accentCls, active && 'ring-2 ring-brand-50')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.subtitle}</div>
                </div>
                {active && <span className="badge-brand">Активен</span>}
              </div>

              <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-1">
                {c.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <button className="btn-primary w-full mt-4" onClick={() => setTariff(c.id)}>
                Использовать {c.title} (demo)
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature matrix */}
      <div className="card p-4">
        <div className="text-sm font-medium mb-3">Матрица функций</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-3">Функция</th>
                <th className="py-2 pr-3">Free</th>
                <th className="py-2 pr-3">Postpay</th>
                <th className="py-2 pr-3">Flex</th>
              </tr>
            </thead>
            <tbody>
              {features.map(f => (
                <tr key={f.id} className="border-t border-slate-100 align-top">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-slate-800">{f.title}</div>
                    {f.note && <div className="text-xs text-slate-500 mt-1">{f.note}</div>}
                  </td>
                  <td className="py-3 pr-3">{renderCell(f.free)}</td>
                  <td className="py-3 pr-3">{renderCell(f.postpay)}</td>
                  <td className="py-3 pr-3">{renderCell(f.flex)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Behavior notes */}
      <div className="grid md:grid-cols-3 gap-4">
        <NoteCard
          title="Как работает Free"
          text={[
            'Флоу: вход → поиск → покупка.',
            'Оплата только личной картой.',
            'Подсветка политик без обязательных аппрувов.',
            'Поддержки нет (только FAQ).',
          ]}
        />
        <NoteCard
          title="Как работает Postpay"
          text={[
            'Появляется опция Postpay на оплате.',
            'Показываем лимит и срок оплаты.',
            'Если Out of Policy — требуется согласование.',
            'Сервисный сбор ~7%.',
          ]}
        />
        <NoteCard
          title="Как работает Flex"
          text={[
            'Включены обмены/возвраты.',
            'VIP-поддержка 24/7.',
            'Белые VIP-карточки в UI.',
            'Возможны API-интеграции (demo-маркер).',
          ]}
        />
      </div>
    </div>
  )
}

function renderCell(v: boolean | 'limited') {
  if (v === true) return <span className="badge-ok">Да</span>
  if (v === 'limited') return <span className="badge-warn">Частично</span>
  return <span className="badge bg-slate-50 text-slate-400">Нет</span>
}

function NoteCard({ title, text }: { title: string; text: string[] }) {
  return (
    <div className="card p-4">
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-2 text-sm text-slate-600 list-disc pl-5 space-y-1">
        {text.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
