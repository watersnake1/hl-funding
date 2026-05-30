import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { PairResult } from '../types'

interface FundingRateChartProps {
  pair: PairResult
}

const LONG_COLOR = '#00e676'
const SHORT_COLOR = '#ff5252'

function buildChartData(pair: PairResult) {
  const allTimes = Array.from(
    new Set([
      ...pair.longFundingHistory.map((e) => e.time),
      ...pair.shortFundingHistory.map((e) => e.time),
    ])
  ).sort((a, b) => a - b)

  const longMap = new Map(pair.longFundingHistory.map((e) => [e.time, parseFloat(e.fundingRate)]))
  const shortMap = new Map(pair.shortFundingHistory.map((e) => [e.time, parseFloat(e.fundingRate)]))

  return allTimes.map((t) => ({
    time: new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timestamp: t,
    [pair.longAsset]: longMap.has(t) ? (longMap.get(t)! * 100) : null,
    [pair.shortAsset]: shortMap.has(t) ? (shortMap.get(t)! * 100) : null,
  }))
}

function paddedDomain(data: ReturnType<typeof buildChartData>, keys: string[]): [number, number] {
  const values = data.flatMap((d) =>
    keys.map((k) => (d[k] != null ? Number(d[k]) : null))
  ).filter((v): v is number => v !== null)

  if (values.length === 0) return [-0.01, 0.01]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.15 || Math.abs(max) * 0.15 || 0.001
  return [min - pad, max + pad]
}

export function FundingRateChart({ pair }: FundingRateChartProps) {
  const data = buildChartData(pair)
  const domain = paddedDomain(data, [pair.longAsset, pair.shortAsset])

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          30-Day Funding Rate History
        </h3>
      </div>

      {/* Custom legend outside the SVG */}
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 rounded" style={{ backgroundColor: LONG_COLOR }} />
          <span className="text-xs font-mono" style={{ color: LONG_COLOR }}>{pair.longAsset} (long)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-5 h-0.5 rounded" style={{ backgroundColor: SHORT_COLOR }} />
          <span className="text-xs font-mono" style={{ color: SHORT_COLOR }}>{pair.shortAsset} (short)</span>
        </div>
        <span className="text-xs text-muted font-mono ml-auto">8-hourly rate (%)</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={{ stroke: '#2a2a3a' }}
          />
          <YAxis
            domain={domain}
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toFixed(3)}%`}
            width={68}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#16161f',
              border: '1px solid #2a2a3a',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#8888aa' }}
            formatter={(value: unknown, name: string) => [
              `${Number(value).toFixed(5)}%`,
              name,
            ]}
          />
          <ReferenceLine y={0} stroke="#3a3a5a" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey={pair.longAsset}
            stroke={LONG_COLOR}
            strokeWidth={1.5}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={pair.shortAsset}
            stroke={SHORT_COLOR}
            strokeWidth={1.5}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
