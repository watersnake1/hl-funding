import type { Asset, AssetCtx, FundingEntry, Candle } from '../types'

const HL_API = '/api/hl/info'

async function post<T>(body: Record<string, unknown>, attempt = 0): Promise<T> {
  const res = await fetch(HL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (res.status === 429) {
    if (attempt >= 4) throw new Error('Rate limited by Hyperliquid API after retries')
    const backoff = 1000 * (attempt + 1)
    await new Promise((r) => setTimeout(r, backoff))
    return post(body, attempt + 1)
  }

  if (!res.ok) throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function fetchMetaAndCtxs(): Promise<[{ universe: Asset[] }, AssetCtx[]]> {
  return post({ type: 'metaAndAssetCtxs' })
}

export async function fetchFundingHistory(
  coin: string,
  startTime: number,
  endTime: number
): Promise<FundingEntry[]> {
  return post({ type: 'fundingHistory', coin, startTime, endTime })
}

export async function fetchCandles(
  coin: string,
  startTime: number,
  endTime: number
): Promise<Candle[]> {
  return post({
    type: 'candleSnapshot',
    req: { coin, interval: '1d', startTime, endTime },
  })
}

export function getLookbackWindow(): { startTime: number; endTime: number } {
  const endTime = Date.now()
  const startTime = endTime - 14 * 24 * 60 * 60 * 1000
  return { startTime, endTime }
}
