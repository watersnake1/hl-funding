import { useState } from 'react'
import type { PairResult, AssetCategory } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/assetCategories'

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
      {sign}{value.toFixed(3)}
    </span>
  )
}

export function TopPairsTable({ pairs, selectedIndex, onSelect }: TopPairsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all')

  const presentCategories = new Set<AssetCategory>()
  for (const p of pairs) {
    presentCategories.add(p.longCategory)
    presentCategories.add(p.shortCategory)
  }

  const filtered =
    categoryFilter === 'all'
      ? pairs
      : pairs.filter(
          (p) => p.longCategory === categoryFilter || p.shortCategory === categoryFilter
        )

  // remap selectedIndex into filtered list
  const filteredSelectedIndex = filtered.findIndex(
    (p) => p === pairs[selectedIndex]
  )

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <span className="h-1.5 w-6 rounded-full bg-accent" />
          <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
            Top {pairs.length} Pairs by Score
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded border uppercase tracking-wider transition-colors ${
              categoryFilter === 'all'
                ? 'bg-accent/20 border-accent text-accent'
                : 'border-border text-muted hover:text-white hover:border-white/30'
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.filter((c) => presentCategories.has(c)).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded border uppercase tracking-wider transition-colors ${
                categoryFilter === cat
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'border-border text-muted hover:text-white hover:border-white/30'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Long</th>
              <th className="px-4 py-3 text-left">Short</th>
              <th className="px-4 py-3 text-right">APY</th>
              <th className="px-4 py-3 text-right">Corr</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right">Daily/$1k</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted text-xs">
                  No pairs match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((pair, i) => {
                const isSelected = i === filteredSelectedIndex
                const globalIndex = pairs.indexOf(pair)
                return (
                  <tr
                    key={`${pair.longAsset}-${pair.shortAsset}`}
                    onClick={() => onSelect(globalIndex)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3 text-muted">{globalIndex + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-positive font-semibold">{pair.longAsset}</span>
                        <CategoryBadge category={pair.longCategory} size="xs" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-negative font-semibold">{pair.shortAsset}</span>
                        <CategoryBadge category={pair.shortCategory} size="xs" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-accent font-semibold">
                      {pair.fundingAPY.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CorrelationBadge value={pair.correlation} />
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {pair.compositeScore.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right text-positive">
                      ${pair.dailyIncomePerK.toFixed(2)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 text-xs text-muted font-mono border-t border-border/50">
        Click any row to inspect its funding and price charts · Filter by asset class above
      </div>
    </div>
  )
}
