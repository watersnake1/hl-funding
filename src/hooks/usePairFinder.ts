import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchMetaAndCtxs,
  fetchFundingHistory,
  fetchCandles,
  getLookbackWindow,
} from '../api/hyperliquid'
import { prepareAssetData, findBestPairs } from '../utils/algorithm'
import { getAssetCategory } from '../utils/assetCategories'
import type { AssetData, AssetCategory, PairResult } from '../types'

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 400

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export interface UniverseSummary {
  category: AssetCategory
  count: number
  coins: string[]
}

interface UsePairFinderResult {
  pairs: PairResult[]
  bestPair: PairResult | null
  isLoading: boolean
  loadedCount: number
  totalCount: number
  universeSummary: UniverseSummary[]
  error: Error | null
  lastUpdated: Date | null
  refetch: () => void
}

export function usePairFinder(): UsePairFinderResult {
  const [refreshToken, setRefreshToken] = useState(0)
  const { startTime, endTime } = useMemo(() => getLookbackWindow(), [refreshToken])
  const [loadedCount, setLoadedCount] = useState(0)

  const metaQuery = useQuery({
    queryKey: ['meta', refreshToken],
    queryFn: fetchMetaAndCtxs,
    staleTime: 5 * 60 * 1000,
  })

  const allCoins = useMemo(() => {
    if (!metaQuery.data) return []
    const [meta, ctxs] = metaQuery.data
    return meta.universe
      .map((a, i) => ({
        name: a.name,
        notionalOI:
          parseFloat(ctxs[i]?.openInterest ?? '0') * parseFloat(ctxs[i]?.markPx ?? '0'),
      }))
      .filter((a) => a.notionalOI > 0)
      .sort((a, b) => b.notionalOI - a.notionalOI)
      .map((a) => a.name)
  }, [metaQuery.data])

  const universeSummary: UniverseSummary[] = useMemo(() => {
    const grouped: Record<AssetCategory, string[]> = {
      crypto: [], equity: [], commodity: [], index: [], forex: [], preipo: [],
    }
    for (const name of allCoins) {
      grouped[getAssetCategory(name)].push(name)
    }
    return (Object.entries(grouped) as [AssetCategory, string[]][])
      .filter(([, coins]) => coins.length > 0)
      .map(([category, coins]) => ({ category, count: coins.length, coins }))
  }, [allCoins])

  const assetDataQuery = useQuery({
    queryKey: ['assetData', allCoins, startTime, refreshToken],
    enabled: allCoins.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AssetData[]> => {
      setLoadedCount(0)
      const results: AssetData[] = []

      for (let i = 0; i < allCoins.length; i += BATCH_SIZE) {
        const batch = allCoins.slice(i, i + BATCH_SIZE)

        const batchResults = await Promise.allSettled(
          batch.map(async (coin) => {
            const [funding, candles] = await Promise.all([
              fetchFundingHistory(coin, startTime, endTime),
              fetchCandles(coin, startTime, endTime),
            ])
            return { coin, funding, candles }
          })
        )

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            const { coin, funding, candles } = result.value
            if (candles.length >= 4) {
              results.push(prepareAssetData(coin, funding, candles))
            }
          }
        }

        setLoadedCount(results.length)

        if (i + BATCH_SIZE < allCoins.length) {
          await delay(BATCH_DELAY_MS)
        }
      }

      return results
    },
  })

  const pairs = useMemo(() => {
    if (!assetDataQuery.data) return []
    return findBestPairs(assetDataQuery.data)
  }, [assetDataQuery.data])

  const isLoading =
    metaQuery.isLoading || (allCoins.length > 0 && assetDataQuery.isLoading)

  const totalCount = allCoins.length
  const error = (metaQuery.error ?? assetDataQuery.error) as Error | null

  const lastUpdated = useMemo(
    () => (assetDataQuery.isSuccess ? new Date() : null),
    [assetDataQuery.isSuccess, assetDataQuery.dataUpdatedAt]
  )

  function refetch() {
    setRefreshToken((t) => t + 1)
    setLoadedCount(0)
  }

  return {
    pairs,
    bestPair: pairs[0] ?? null,
    isLoading,
    loadedCount,
    totalCount,
    universeSummary,
    error,
    lastUpdated,
    refetch,
  }
}
