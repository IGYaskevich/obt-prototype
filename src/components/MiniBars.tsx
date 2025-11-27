export function MiniBars({
                      title,
                      items
                  }:{
    title: string
    items: {label:string; value:number}[]
}) {
    const max = Math.max(1, ...items.map(i=>i.value))

    return (
        <div>
            <div className="text-xs text-slate-500 mb-2">{title}</div>
            <div className="space-y-2">
                {items.map(i=>(
                    <div key={i.label}>
                        <div className="flex items-center justify-between text-sm">
                            <span>{i.label}</span>
                            <span className="text-slate-500">{i.value}</span>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-brand-500/70"
                                style={{ width: `${(i.value/max)*100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}