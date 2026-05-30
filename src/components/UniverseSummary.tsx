import type { UniverseSummary } from '../hooks/usePairFinder'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/assetCategories'

interface UniverseSummaryProps {
  summary: UniverseSummary[]
}

export function UniverseSummaryBar({ summary }: UniverseSummaryProps) {
  if (summary.length === 0) return null
  const total = summary.reduce((s, g) => s + g.count, 0)

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      <span className="text-xs font-mono text-muted uppercase tracking-wider shrink-0">
        Universe — {total} assets
      </span>
      {summary.map(({ category, count, coins }) => (
        <div
          key={category}
          className="flex items-center gap-1.5 group relative"
          title={coins.join(', ')}
        >
          <span
            className={`inline-flex items-center rounded border font-mono font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 ${CATEGORY_COLORS[category]}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
          <span className="text-xs font-mono text-white">{count}</span>
          <span className="text-xs font-mono text-muted hidden group-hover:block absolute left-0 top-6 z-10 bg-card border border-border rounded px-2 py-1 whitespace-nowrap max-w-xs truncate">
            {coins.join(', ')}
          </span>
        </div>
      ))}
    </div>
  )
}
