import type { Candle, FundingEntry } from '../types'

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0

  const xs = x.slice(0, n)
  const ys = y.slice(0, n)

  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  let num = 0
  let denX = 0
  let denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  const den = Math.sqrt(denX * denY)
  if (den === 0) return 0
  return Math.max(-1, Math.min(1, num / den))
}

export function calcDailyReturns(candles: Candle[]): number[] {
  if (candles.length < 2) return []
  const returns: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const prev = parseFloat(candles[i - 1].c)
    const curr = parseFloat(candles[i].c)
    if (prev !== 0) returns.push((curr - prev) / prev)
  }
  return returns
}

// Average daily funding rate as a decimal (e.g. 0.001 = 0.1% per day)
// Funding is 8-hourly (3 per day), so multiply mean by 3
export function calcAvgDailyFundingRate(entries: FundingEntry[]): number {
  if (entries.length === 0) return 0
  const mean = entries.reduce((sum, e) => sum + parseFloat(e.fundingRate), 0) / entries.length
  return mean * 3
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(1)}%`
}
