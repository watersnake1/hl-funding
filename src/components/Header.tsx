interface HeaderProps {
  lastUpdated: Date | null
  isLoading: boolean
  onRefresh: () => void
}

export function Header({ lastUpdated, isLoading, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-mono">
          Hyperliquid Pair Optimizer
        </h1>
        <p className="text-xs text-muted mt-0.5 font-mono">
          14d lookback · 2× leverage · 50/50 capital split · 70% funding / 30% correlation score
        </p>
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-xs text-muted font-mono">
            Last run: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-mono font-medium border border-accent text-accent rounded hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </header>
  )
}
