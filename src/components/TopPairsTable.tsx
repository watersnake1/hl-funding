import { useState, useEffect, useMemo } from 'react'
import type { PairResult, AssetCategory } from '../types'
import { CategoryBadge } from './CategoryBadge'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../utils/assetCategories'

const PAGE_SIZE = 25

type SortKey = 'longAsset' | 'shortAsset' | 'fundingAPY' | 'correlation' | 'compositeScore' | 'combinedPricePnL' | 'fundingPnL' | 'netPnL'
type SortDir = 'desc' | 'asc'

interface TopPairsTableProps {
  pairs: PairResult[]
  selectedIndex: number
  onSelect: (index: number) => void
}

function CorrelationBadge({ value }: { value: number }) {
  const color = value < -0.3 ? 'text-positive' : value > 0.3 ? 'text-negative' : 'text-yellow-400'
  const sign = value >= 0 ? '+' : ''
  return <span className={`font-mono text-xs ${color}`}>{sign}{value.toFixed(3)}</span>
}

function PageButton({ onClick, disabled, active, children }: {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-7 px-2 text-xs font-mono rounded border transition-colors
        ${active
          ? 'bg-accent/20 border-accent text-accent'
          : disabled
            ? 'border-border text-muted/40 cursor-not-allowed'
            : 'border-border text-muted hover:text-white hover:border-white/30'
        }`}
    >
      {children}
    </button>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <span className="ml-1 opacity-25">↕</span>
  return <span className="ml-1 text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>
}

function ColHeader({ label, col, align = 'right', sortKey, sortDir, onSort }: {
  label: string
  col: SortKey
  align?: 'left' | 'right'
  sortKey: SortKey
  sortDir: SortDir
  onSort: (col: SortKey) => void
}) {
  return (
    <th
      className={`px-4 py-3 text-${align} cursor-pointer select-none hover:text-white transition-colors whitespace-nowrap`}
      onClick={() => onSort(col)}
    >
      {label}
      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </th>
  )
}

function sortPairs(pairs: PairResult[], key: SortKey, dir: SortDir): PairResult[] {
  const sign = dir === 'desc' ? -1 : 1
  return [...pairs].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (typeof av === 'string' && typeof bv === 'string') {
      return sign * av.localeCompare(bv)
    }
    return sign * ((av as number) - (bv as number))
  })
}

export function TopPairsTable({ pairs, selectedIndex, onSelect }: TopPairsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('compositeScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(col: SortKey) {
    if (col === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(col)
      setSortDir('desc')
    }
    setPage(0)
  }

  const presentCategories = new Set<AssetCategory>()
  for (const p of pairs) {
    presentCategories.add(p.longCategory)
    presentCategories.add(p.shortCategory)
  }

  const filtered = useMemo(() => {
    const base = categoryFilter === 'all'
      ? pairs
      : pairs.filter(p => p.longCategory === categoryFilter || p.shortCategory === categoryFilter)
    return sortPairs(base, sortKey, sortDir)
  }, [pairs, categoryFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => { setPage(0) }, [categoryFilter, sortKey, sortDir])

  useEffect(() => {
    const filteredIdx = filtered.findIndex(p => p === pairs[selectedIndex])
    if (filteredIdx >= 0) {
      const targetPage = Math.floor(filteredIdx / PAGE_SIZE)
      if (targetPage !== page) setPage(targetPage)
    }
  }, [selectedIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const pageSlice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const filteredSelectedIndex = filtered.findIndex(p => p === pairs[selectedIndex])

  function pageNumbers(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages: (number | '…')[] = []
    const around = new Set([0, page - 1, page, page + 1, totalPages - 1].filter(p => p >= 0 && p < totalPages))
    let prev = -1
    for (const p of [...around].sort((a, b) => a - b)) {
      if (prev >= 0 && p - prev > 1) pages.push('…')
      pages.push(p)
      prev = p
    }
    return pages
  }

  const colProps = { sortKey, sortDir, onSort: handleSort }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <span className="h-1.5 w-6 rounded-full bg-accent" />
          <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
            {filtered.length} Pairs
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
          {ALL_CATEGORIES.filter(c => presentCategories.has(c)).map(cat => (
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-border text-muted text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-8">#</th>
              <ColHeader label="Long"      col="longAsset"       align="left"  {...colProps} />
              <ColHeader label="Short"     col="shortAsset"      align="left"  {...colProps} />
              <ColHeader label="APY"       col="fundingAPY"                    {...colProps} />
              <ColHeader label="Corr"      col="correlation"                   {...colProps} />
              <ColHeader label="Score"     col="compositeScore"                {...colProps} />
              <ColHeader label="Price PnL" col="combinedPricePnL"              {...colProps} />
              <ColHeader label="Fund PnL"  col="fundingPnL"                    {...colProps} />
              <ColHeader label="Net PnL"   col="netPnL"                        {...colProps} />
            </tr>
          </thead>
          <tbody>
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-muted text-xs">
                  No pairs match this filter.
                </td>
              </tr>
            ) : (
              pageSlice.map(pair => {
                const filteredIdx = filtered.indexOf(pair)
                const globalIndex = pairs.indexOf(pair)
                const isSelected = filteredIdx === filteredSelectedIndex
                return (
                  <tr
                    key={`${pair.longAsset}-${pair.shortAsset}`}
                    onClick={() => onSelect(globalIndex)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-4 py-3 text-muted">{filteredIdx + 1}</td>
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
                    <td className={`px-4 py-3 text-right text-xs ${pair.combinedPricePnL >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {pair.combinedPricePnL >= 0 ? '+' : ''}{pair.combinedPricePnL.toFixed(1)}%
                    </td>
                    <td className={`px-4 py-3 text-right text-xs ${pair.fundingPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {pair.fundingPnL >= 0 ? '+' : ''}{pair.fundingPnL.toFixed(1)}%
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${pair.netPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {pair.netPnL >= 0 ? '+' : ''}{pair.netPnL.toFixed(1)}%
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-muted font-mono">
          {filtered.length === 0
            ? 'No results'
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <PageButton onClick={() => setPage(0)} disabled={page === 0}>«</PageButton>
          <PageButton onClick={() => setPage(p => p - 1)} disabled={page === 0}>‹</PageButton>
          {pageNumbers().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-muted font-mono text-xs">…</span>
            ) : (
              <PageButton key={p} onClick={() => setPage(p)} active={p === page}>{p + 1}</PageButton>
            )
          )}
          <PageButton onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>›</PageButton>
          <PageButton onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</PageButton>
        </div>
      </div>
    </div>
  )
}
