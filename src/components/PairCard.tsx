import type { PairResult } from '../types'
import { CategoryBadge } from './CategoryBadge'

interface PairCardProps {
  pair: PairResult
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: 'positive' | 'negative' | 'accent' | 'neutral'
}) {
  const colorClass =
    color === 'positive'
      ? 'text-positive'
      : color === 'negative'
        ? 'text-negative'
        : color === 'accent'
          ? 'text-accent'
          : 'text-white'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted font-mono uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-mono font-semibold ${colorClass}`}>{value}</span>
    </div>
  )
}

function LegCard({
  side,
  asset,
  category,
  avgDailyFunding,
  fundingContribution,
}: {
  side: 'LONG' | 'SHORT'
  asset: string
  category: PairResult['longCategory']
  avgDailyFunding: number
  fundingContribution: number
}) {
  const isLong = side === 'LONG'
  const borderColor = isLong ? 'border-positive/40' : 'border-negative/40'
  const sideColor = isLong ? 'text-positive' : 'text-negative'
  const bgColor = isLong ? 'bg-positive/5' : 'bg-negative/5'
  const fundingSign = avgDailyFunding >= 0 ? '+' : ''
  const contribSign = fundingContribution >= 0 ? '+' : ''

  return (
    <div className={`flex-1 rounded-lg border ${borderColor} ${bgColor} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-mono font-bold ${sideColor} uppercase tracking-widest`}>
          {side}
        </span>
        <CategoryBadge category={category} size="xs" />
      </div>
      <p className="text-2xl font-mono font-bold text-white mb-4">{asset}</p>
      <div className="space-y-3">
        <StatPill
          label="Avg Daily Funding"
          value={`${fundingSign}${(avgDailyFunding * 100).toFixed(4)}%`}
          color={avgDailyFunding >= 0 ? 'positive' : 'negative'}
        />
        <StatPill
          label={`${side} Income (daily %)`}
          value={`${contribSign}${(fundingContribution * 100).toFixed(4)}%`}
          color={fundingContribution >= 0 ? 'positive' : 'negative'}
        />
      </div>
    </div>
  )
}

export function PairCard({ pair }: PairCardProps) {
  const corrColor =
    pair.correlation < -0.3 ? 'positive' : pair.correlation > 0.3 ? 'negative' : 'neutral'
  const corrSign = pair.correlation >= 0 ? '+' : ''

  const longIncome = -pair.avgDailyFundingLong / 100
  const shortIncome = pair.avgDailyFundingShort / 100

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h2 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          Best Pair
        </h2>
      </div>

      <div className="flex gap-4 mb-6">
        <LegCard
          side="LONG"
          asset={pair.longAsset}
          category={pair.longCategory}
          avgDailyFunding={pair.avgDailyFundingLong / 100}
          fundingContribution={longIncome}
        />

        <div className="flex items-center justify-center text-muted font-mono text-lg font-bold px-1">
          ↔
        </div>

        <LegCard
          side="SHORT"
          asset={pair.shortAsset}
          category={pair.shortCategory}
          avgDailyFunding={pair.avgDailyFundingShort / 100}
          fundingContribution={shortIncome}
        />
      </div>

      <div className="border-t border-border pt-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
              Combined APY
            </p>
            <p className="text-3xl font-mono font-bold text-accent">
              {pair.fundingAPY.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
              Price Correlation
            </p>
            <p
              className={`text-2xl font-mono font-bold ${corrColor === 'positive' ? 'text-positive' : corrColor === 'negative' ? 'text-negative' : 'text-white'}`}
            >
              {corrSign}
              {pair.correlation.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
              Composite Score
            </p>
            <p className="text-2xl font-mono font-bold text-white">
              {pair.compositeScore.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">
              Daily / $1,000
            </p>
            <p className="text-2xl font-mono font-bold text-positive">
              ${pair.dailyIncomePerK.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
