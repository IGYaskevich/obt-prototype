import { MiniBars } from './MiniBars.tsx'

export function TypeAnalyticsCard({
  title,
  total,
  byStatus,
  onOpen,
}: {
  title: string
  total: number
  byStatus: { COMPLETED: number; IN_PROGRESS: number; CANCELLED: number }
  onOpen: () => void
}) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">Total: {total}</div>
        </div>
        <button className="btn-ghost" onClick={onOpen}>
          Open flow
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <SmallKpi label="Completed" value={byStatus.COMPLETED} />
        <SmallKpi label="In progress" value={byStatus.IN_PROGRESS} />
        <SmallKpi label="Cancelled" value={byStatus.CANCELLED} />
      </div>

      <MiniBars
        title="Status distribution"
        items={[
          { label: 'Completed', value: byStatus.COMPLETED },
          { label: 'In progress', value: byStatus.IN_PROGRESS },
          { label: 'Cancelled', value: byStatus.CANCELLED },
        ]}
      />
    </div>
  )
}

function SmallKpi({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-100 p-3 ${warn ? 'bg-amber-50/40' : ''}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold mt-0.5 ${warn ? 'text-amber-700' : ''}`}>{value}</div>
    </div>
  )
}
