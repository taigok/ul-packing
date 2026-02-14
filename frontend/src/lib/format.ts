import type { Category, ItemKind, Unit } from '@/lib/types'

const gramsToOz = (weight: number) => Math.round((weight / 28.349523125) * 10) / 10

export const formatWeight = (weightGrams: number, unit: Unit) =>
  unit === 'oz' ? `${gramsToOz(weightGrams).toFixed(1)} oz` : `${weightGrams} g`

export const kindLabel = (kind: ItemKind) => {
  if (kind === 'consumable') return '消耗品'
  if (kind === 'worn') return '着用'
  return 'ベース'
}

export const categoryLabel = (category: Category) => {
  if (category === 'shelter') return 'シェルター'
  if (category === 'sleeping') return 'スリーピング'
  if (category === 'backpack') return 'バックパック'
  if (category === 'clothing') return '衣類'
  if (category === 'cooking') return '調理'
  if (category === 'food') return '食料'
  if (category === 'water') return '水'
  if (category === 'electronics') return '電子機器'
  return 'その他'
}
