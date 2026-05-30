import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { PairResult } from '../types'

interface PriceChartProps {
  pair: PairResult
}

function buildPriceData(pair: PairResult) {
  const longCandles = pair.longCandles
  const shortCandles = pair.shortCandles

  const maxLen = Math.min(longCandles.length, shortCandles.length)
  if (maxLen === 0) return []

  const longBase = parseFloat(longCandles[0].c)
  const shortBase = parseFloat(shortCandles[0].c)

  return Array.from({ length: maxLen }, (_, i) => {
    const longNorm = longBase > 0 ? (parseFloat(longCandles[i].c) / longBase) * 100 : 100
    const shortNorm = shortBase > 0 ? (parseFloat(shortCandles[i].c) / shortBase) * 100 : 100
    const date = new Date(longCandles[i].t)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [pair.longAsset]: longNorm.toFixed(2),
      [pair.shortAsset]: shortNorm.toFixed(2),
    }
  })
}

const LONG_COLOR = '#00e676'
const SHORT_COLOR = '#ff5252'

export function PriceChart({ pair }: PriceChartProps) {
  const data = buildPriceData(pair)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          Normalized Price History
        </h3>
      </div>
      <p className="text-xs text-muted font-mono mb-4">
        Base = 100 at window start · Correlation: {pair.correlation >= 0 ? '+' : ''}
        {pair.correlation.toFixed(3)}
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={{ stroke: '#2a2a3a' }}
          />
          <YAxis
            tick={{ fill: '#8888aa', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toFixed(0)}`}
            width={40}
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
            formatter={(value: unknown) => [`${Number(value).toFixed(2)}`]}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '8px' }}
          />
          <Line
            type="monotone"
            dataKey={pair.longAsset}
            stroke={LONG_COLOR}
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey={pair.shortAsset}
            stroke={SHORT_COLOR}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
