interface LoadingStateProps {
  loadedCount: number
  totalCount: number
}

export function LoadingState({ loadedCount, totalCount }: LoadingStateProps) {
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0
  const isMetaLoading = totalCount === 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-mono font-medium text-sm">
          {isMetaLoading ? 'Fetching market data...' : `Loading asset data`}
        </p>
        {!isMetaLoading && (
          <p className="text-muted font-mono text-xs mt-1">
            {loadedCount} / {totalCount} assets
          </p>
        )}
      </div>

      {!isMetaLoading && (
        <div className="w-64">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted text-xs font-mono mt-1.5 text-center">
            {progress.toFixed(0)}% complete
          </p>
        </div>
      )}

      <p className="text-muted text-xs font-mono text-center max-w-xs">
        Fetching 14-day funding history and price data for top {totalCount || '40'} assets by open
        interest...
      </p>
    </div>
  )
}
