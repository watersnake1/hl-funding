import type { AssetCategory } from './utils/assetCategories'

export type { AssetCategory }

export interface Asset {
  name: string
  szDecimals: number
  maxLeverage: number
  marginTableId: number
  onlyIsolated?: boolean
}

export interface AssetCtx {
  funding: string
  openInterest: string
  prevDayPx: string
  dayNtlVlm: string
  premium: string | null
  oraclePx: string
  markPx: string
  midPx: string | null
  impactPxs: [string, string] | null
}

export interface FundingEntry {
  coin: string
  fundingRate: string
  premium: string
  time: number
}

export interface Candle {
  t: number
  T: number
  s: string
  i: string
  o: string
  h: string
  l: string
  c: string
  v: string
  n: number
}

export interface AssetData {
  name: string
  category: AssetCategory
  fundingHistory: FundingEntry[]
  candles: Candle[]
  avgDailyFundingRate: number
  dailyReturns: number[]
}

export interface PairResult {
  longAsset: string
  longCategory: AssetCategory
  shortAsset: string
  shortCategory: AssetCategory
  fundingAPY: number
  correlation: number
  compositeScore: number
  avgDailyFundingLong: number
  avgDailyFundingShort: number
  longFundingHistory: FundingEntry[]
  shortFundingHistory: FundingEntry[]
  longCandles: Candle[]
  shortCandles: Candle[]
  dailyIncomePerK: number

  // 30-day historical PnL at 2× leverage, 50/50 capital split
  // All values are % of total capital (2× leverage × 50% capital = ×1 factor)
  longEntryPrice: number
  longExitPrice: number
  shortEntryPrice: number
  shortExitPrice: number
  longPricePnL: number       // % — price action on long leg
  shortPricePnL: number      // % — price action on short leg (negative = asset rose)
  combinedPricePnL: number   // % — long + short price PnL
  fundingPnL: number         // % — actual sum of all funding payments over window
  netPnL: number             // % — combinedPricePnL + fundingPnL
  netPnLPerK: number         // $ — net PnL per $1,000 total capital
}

export interface MetaAndAssetCtxs {
  universe: Asset[]
}
