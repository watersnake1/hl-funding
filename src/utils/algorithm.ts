import type { AssetData, PairResult } from '../types'
import { pearsonCorrelation, calcAvgDailyFundingRate, calcDailyReturns } from './stats'
import { getAssetCategory } from './assetCategories'

const FUNDING_WEIGHT = 0.7
const CORRELATION_WEIGHT = 0.3
const TOP_N_PAIRS = 10

export function prepareAssetData(
  name: string,
  fundingHistory: AssetData['fundingHistory'],
  candles: AssetData['candles']
): AssetData {
  return {
    name,
    category: getAssetCategory(name),
    fundingHistory,
    candles,
    avgDailyFundingRate: calcAvgDailyFundingRate(fundingHistory),
    dailyReturns: calcDailyReturns(candles),
  }
}

export function findBestPairs(assets: AssetData[]): PairResult[] {
  const candidates: PairResult[] = []

  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      if (i === j) continue

      const longAsset = assets[i]
      const shortAsset = assets[j]

      // Long pays when funding > 0, receives when < 0
      // Short receives when funding > 0, pays when < 0
      // Net daily income rate = avgDailyRate_short - avgDailyRate_long
      // At 2x leverage with 50/50 split: notional = total capital
      const netDailyRate = shortAsset.avgDailyFundingRate - longAsset.avgDailyFundingRate
      const fundingAPY = netDailyRate * 365 * 100

      if (fundingAPY <= 0) continue

      const minLen = Math.min(longAsset.dailyReturns.length, shortAsset.dailyReturns.length)
      if (minLen < 3) continue

      const correlation = pearsonCorrelation(
        longAsset.dailyReturns.slice(0, minLen),
        shortAsset.dailyReturns.slice(0, minLen)
      )

      candidates.push({
        longAsset: longAsset.name,
        longCategory: longAsset.category,
        shortAsset: shortAsset.name,
        shortCategory: shortAsset.category,
        fundingAPY,
        correlation,
        compositeScore: 0,
        avgDailyFundingLong: longAsset.avgDailyFundingRate * 100,
        avgDailyFundingShort: shortAsset.avgDailyFundingRate * 100,
        longFundingHistory: longAsset.fundingHistory,
        shortFundingHistory: shortAsset.fundingHistory,
        longCandles: longAsset.candles,
        shortCandles: shortAsset.candles,
        dailyIncomePerK: (fundingAPY / 100 / 365) * 1000,
      })
    }
  }

  if (candidates.length === 0) return []

  const maxAPY = Math.max(...candidates.map((p) => p.fundingAPY))

  const scored = candidates.map((p) => {
    const normalizedAPY = maxAPY > 0 ? p.fundingAPY / maxAPY : 0
    // corrScore: correlation=-1 → 1.0 (best), correlation=+1 → 0.0 (worst)
    const corrScore = (-p.correlation + 1) / 2
    const compositeScore = FUNDING_WEIGHT * normalizedAPY + CORRELATION_WEIGHT * corrScore
    return { ...p, compositeScore }
  })

  scored.sort((a, b) => b.compositeScore - a.compositeScore)
  return scored.slice(0, TOP_N_PAIRS)
}
