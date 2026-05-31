import type { AssetData, PairResult } from '../types'
import { pearsonCorrelation, calcAvgDailyFundingRate, calcDailyReturns } from './stats'
import { getAssetCategory } from './assetCategories'

const FUNDING_WEIGHT = 0.7
const CORRELATION_WEIGHT = 0.3

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

// 2× leverage, 50/50 capital split → notional per leg = total capital
// So all PnL fractions map 1:1 to total capital (the ×2 and ×0.5 cancel)
function calcPricePnLPct(candles: AssetData['candles']): {
  entry: number
  exit: number
  pnlPct: number
} {
  if (candles.length === 0) return { entry: 0, exit: 0, pnlPct: 0 }
  const entry = parseFloat(candles[0].o)
  const exit = parseFloat(candles[candles.length - 1].c)
  const pnlPct = entry > 0 ? ((exit - entry) / entry) * 100 : 0
  return { entry, exit, pnlPct }
}

function calcTotalFundingPct(fundingHistory: AssetData['fundingHistory']): number {
  // Sum of all 8-hourly funding rates over the window (as % of notional = total capital)
  return fundingHistory.reduce((sum, e) => sum + parseFloat(e.fundingRate), 0) * 100
}

export function findBestPairs(assets: AssetData[]): PairResult[] {
  const candidates: PairResult[] = []

  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      if (i === j) continue

      const longAsset = assets[i]
      const shortAsset = assets[j]

      // Funding: long pays when rate > 0, receives when < 0
      //          short receives when rate > 0, pays when < 0
      // Net daily income = avgDailyRate_short - avgDailyRate_long
      const netDailyRate = shortAsset.avgDailyFundingRate - longAsset.avgDailyFundingRate
      const fundingAPY = netDailyRate * 365 * 100
      if (fundingAPY <= 0) continue

      const minLen = Math.min(longAsset.dailyReturns.length, shortAsset.dailyReturns.length)
      if (minLen < 3) continue

      const correlation = pearsonCorrelation(
        longAsset.dailyReturns.slice(0, minLen),
        shortAsset.dailyReturns.slice(0, minLen)
      )

      // 30-day historical PnL
      const longPrice = calcPricePnLPct(longAsset.candles)
      const shortPrice = calcPricePnLPct(shortAsset.candles)

      const longPricePnL = longPrice.pnlPct          // positive = asset rose = good for long
      const shortPricePnL = -shortPrice.pnlPct        // positive = asset fell = good for short

      const combinedPricePnL = longPricePnL + shortPricePnL

      // Actual realized funding: short receives, long pays
      const totalShortFunding = calcTotalFundingPct(shortAsset.fundingHistory)
      const totalLongFunding = calcTotalFundingPct(longAsset.fundingHistory)
      const fundingPnL = totalShortFunding - totalLongFunding  // net received

      const netPnL = combinedPricePnL + fundingPnL

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
        longEntryPrice: longPrice.entry,
        longExitPrice: longPrice.exit,
        shortEntryPrice: shortPrice.entry,
        shortExitPrice: shortPrice.exit,
        longPricePnL,
        shortPricePnL,
        combinedPricePnL,
        fundingPnL,
        netPnL,
        netPnLPerK: netPnL * 10,
      })
    }
  }

  if (candidates.length === 0) return []

  const maxAPY = Math.max(...candidates.map((p) => p.fundingAPY))

  const scored = candidates.map((p) => {
    const normalizedAPY = maxAPY > 0 ? p.fundingAPY / maxAPY : 0
    const corrScore = (-p.correlation + 1) / 2
    const compositeScore = FUNDING_WEIGHT * normalizedAPY + CORRELATION_WEIGHT * corrScore
    return { ...p, compositeScore }
  })

  scored.sort((a, b) => b.compositeScore - a.compositeScore)
  return scored
}
