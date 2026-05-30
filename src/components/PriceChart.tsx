import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PairResult } from '../types'

interface PriceChartProps {
  pair: PairResult
}

const LONG_COLOR = '#00e676'
const SHORT_COLOR = '#ff5252'

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
    return {
      date: new Date(longCandles[i].t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [pair.longAsset]: longNorm,
      [pair.shortAsset]: shortNorm,
    }
  })
}

function paddedDomain(data: ReturnType<typeof buildPriceData>, keys: string[]): [number, number] {
  const values = data.flatMap((d) =>
    keys.map((k) => (d[k] != null ? Number(d[k]) : null))
  ).filter((v): v is number => v !== null)

  if (values.length === 0) return [90, 110]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.15 || 5
  return [min - pad, max + pad]
}

export function PriceChart({ pair }: PriceChartProps) {
  const data = buildPriceData(pair)
  const domain = paddedDomain(data, [pair.longAsset, pair.shortAsset])
  const corrSign = pair.correlation >= 0 ? '+' : ''

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <h3 className="text-xs font-mono font-semibold text-muted uppercase tracking-widest">
          Normalized Price History
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
        <span className="text-xs text-muted font-mono ml-auto">
          Corr: {corrSign}{pair.correlation.toFixed(3)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="date"
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
            tickFormatter={(v) => `${Number(v).toFixed(0)}`}
            width={44}
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
              `${Number(value).toFixed(2)}`,
              name,
            ]}
          />
          <Line
            type="monotone"
            dataKey={pair.longAsset}
            stroke={LONG_COLOR}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={pair.shortAsset}
            stroke={SHORT_COLOR}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
