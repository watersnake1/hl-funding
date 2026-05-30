import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { PairResult } from '../types'

interface FundingRateChartProps {
  pair: PairResult
}

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
    [pair.longAsset]: longMap.has(t) ? (longMap.get(t)! * 100).toFixed(5) : null,
    [pair.shortAsset]: shortMap.has(t) ? (shortMap.get(t)! * 100).toFixed(5) : null,
  }))
}

const LONG_COLOR = '#00e676'
const SHORT_COLOR = '#ff5252'

export function FundingRateChart({ pair }: FundingRateChartProps) {
  const data = buildChartData(pair)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          14-Day Funding Rate History
        </h3>
      </div>
      <p className="text-xs text-muted font-mono mb-4">8-hourly funding rate (%)</p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={{ stroke: '#2a2a3a' }}
          />
          <YAxis
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toFixed(3)}%`}
            width={65}
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
            formatter={(value: unknown) => [`${Number(value).toFixed(5)}%`]}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '8px' }}
          />
          <ReferenceLine y={0} stroke="#2a2a3a" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey={pair.longAsset}
            stroke={LONG_COLOR}
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey={pair.shortAsset}
            stroke={SHORT_COLOR}
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
