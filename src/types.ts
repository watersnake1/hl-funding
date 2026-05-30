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
}

export interface MetaAndAssetCtxs {
  universe: Asset[]
}
