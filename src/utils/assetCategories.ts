export type AssetCategory = 'crypto' | 'equity' | 'commodity' | 'index' | 'forex' | 'preipo'

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  crypto: 'Crypto',
  equity: 'Equity',
  commodity: 'Commodity',
  index: 'Index',
  forex: 'Forex',
  preipo: 'Pre-IPO',
}

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  crypto: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  equity: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  commodity: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  index: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  forex: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  preipo: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
}

const EQUITY_TICKERS = new Set([
  // US Tech
  'NVDA', 'TSLA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'GOOG',
  'AMD', 'INTC', 'MU', 'PLTR', 'ORCL', 'MSTR', 'COIN', 'HOOD',
  'NFLX', 'CRCL', 'SNDK', 'RIVN', 'USAR', 'PYPL', 'SQ', 'SHOP',
  'UBER', 'SNAP', 'RBLX', 'GME', 'AMC', 'BABA', 'JD', 'PDD',
  'NIO', 'XPEV', 'LI', 'LCID', 'DIS', 'BIDU', 'MELI', 'SE',
  // International
  'TSM', 'SKHYNIX', 'SAMSUNG', 'HYUNDAI',
  // Finance
  'GS', 'JPM', 'BAC', 'WFC', 'MS', 'C', 'BRK',
  // ETFs treated as equity
  'SPY', 'QQQ', 'URNM', 'DRAM', 'XLE', 'EWY', 'EWJ', 'EWT', 'EWZ',
])

const COMMODITY_TICKERS = new Set([
  // Metals
  'GOLD', 'SILVER', 'XAU', 'XAG', 'PLATINUM', 'PALLADIUM', 'COPPER',
  // Energy
  'WTIOIL', 'WTI', 'BRENTOIL', 'BRENT', 'NATGAS', 'OIL',
])

const INDEX_TICKERS = new Set([
  'SP500', 'XYZ100', 'NDX', 'SPX', 'JP225', 'KR200', 'DJI', 'VIX',
])

const FOREX_TICKERS = new Set([
  'JPY', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'KRW',
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD',
])

const PREIPO_TICKERS = new Set([
  // Known pre-IPO perps
  'SPCX', 'CBRS', 'ANTH', 'STRPE', 'OPENAI', 'DATABRICKS', 'KLARNA',
])

function stripSettlementSuffix(name: string): string {
  return name.replace(/-(USDC|USDH|USD|USDT)$/i, '')
}

export function getAssetCategory(name: string): AssetCategory {
  const base = stripSettlementSuffix(name).toUpperCase()
  if (PREIPO_TICKERS.has(base)) return 'preipo'
  if (EQUITY_TICKERS.has(base)) return 'equity'
  if (COMMODITY_TICKERS.has(base)) return 'commodity'
  if (INDEX_TICKERS.has(base)) return 'index'
  if (FOREX_TICKERS.has(base)) return 'forex'
  return 'crypto'
}

export const ALL_CATEGORIES: AssetCategory[] = [
  'crypto', 'equity', 'commodity', 'index', 'forex', 'preipo',
]
