import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/assetCategories'
import type { AssetCategory } from '../types'

interface CategoryBadgeProps {
  category: AssetCategory
  size?: 'sm' | 'xs'
}

export function CategoryBadge({ category, size = 'xs' }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
  return (
    <span
      className={`inline-flex items-center rounded border font-mono font-semibold uppercase tracking-wider ${colorClass} ${sizeClass}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
