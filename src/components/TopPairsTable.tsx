import type { PairResult } from '../types'

interface TopPairsTableProps {
  pairs: PairResult[]
  selectedIndex: number
  onSelect: (index: number) => void
}

function CorrelationBadge({ value }: { value: number }) {
  const color =
    value < -0.3 ? 'text-positive' : value > 0.3 ? 'text-negative' : 'text-yellow-400'
  const sign = value >= 0 ? '+' : ''
  return (
    <span className={`font-mono text-xs ${color}`}>
      {sign}
      {value.toFixed(3)}
    </span>
  )
}

export function TopPairsTable({ pairs, selectedIndex, onSelect }: TopPairsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          Top {pairs.length} Pairs by Composite Score
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="px-5 py-3 text-left w-10">#</th>
              <th className="px-5 py-3 text-left">Long</th>
              <th className="px-5 py-3 text-left">Short</th>
              <th className="px-5 py-3 text-right">Funding APY</th>
              <th className="px-5 py-3 text-right">Correlation</th>
              <th className="px-5 py-3 text-right">Score</th>
              <th className="px-5 py-3 text-right">Daily / $1k</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, i) => {
              const isSelected = i === selectedIndex
              return (
                <tr
                  key={`${pair.longAsset}-${pair.shortAsset}`}
                  onClick={() => onSelect(i)}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <td className="px-5 py-3 text-muted">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="text-positive font-semibold">{pair.longAsset}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-negative font-semibold">{pair.shortAsset}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-accent font-semibold">
                    {pair.fundingAPY.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-right">
                    <CorrelationBadge value={pair.correlation} />
                  </td>
                  <td className="px-5 py-3 text-right text-white">{pair.compositeScore.toFixed(3)}</td>
                  <td className="px-5 py-3 text-right text-positive">
                    ${pair.dailyIncomePerK.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 text-xs text-muted font-mono border-t border-border/50">
        Click any row to inspect its funding and price charts above
      </div>
    </div>
  )
}
