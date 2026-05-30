import { useState } from 'react'
import { usePairFinder } from './hooks/usePairFinder'
import { Header } from './components/Header'
import { LoadingState } from './components/LoadingState'
import { PairCard } from './components/PairCard'
import { FundingRateChart } from './components/FundingRateChart'
import { PriceChart } from './components/PriceChart'
import { TopPairsTable } from './components/TopPairsTable'

export default function App() {
  const { pairs, isLoading, loadedCount, totalCount, error, lastUpdated, refetch } =
    usePairFinder()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const displayedPair = pairs[selectedIndex] ?? null

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-negative font-mono font-semibold mb-2">Failed to load data</p>
          <p className="text-muted font-mono text-xs mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 text-xs font-mono border border-accent text-accent rounded hover:bg-accent/10 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header lastUpdated={lastUpdated} isLoading={isLoading} onRefresh={refetch} />

      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <LoadingState loadedCount={loadedCount} totalCount={totalCount} />
        ) : displayedPair ? (
          <div className="flex flex-col gap-6">
            <PairCard pair={displayedPair} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FundingRateChart pair={displayedPair} />
              <PriceChart pair={displayedPair} />
            </div>

            <TopPairsTable
              pairs={pairs}
              selectedIndex={selectedIndex}
              onSelect={(i) => {
                setSelectedIndex(i)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted font-mono text-sm">
              No viable pairs found. Try refreshing.
            </p>
          </div>
        )}
      </main>

      <footer className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted font-mono text-center">
          Data from{' '}
          <span className="text-accent">Hyperliquid</span> · Not financial advice
        </p>
      </footer>
    </div>
  )
}
