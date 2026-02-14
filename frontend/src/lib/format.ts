import type { ItemKind, Unit } from '@/lib/types'

const gramsToOz = (weight: number) => Math.round((weight / 28.349523125) * 10) / 10

export const formatWeight = (weightGrams: number, unit: Unit) =>
  unit === 'oz' ? `${gramsToOz(weightGrams).toFixed(1)} oz` : `${weightGrams} g`

export const kindLabel = (kind: ItemKind) => {
  if (kind === 'consumable') return 'Consumable'
  if (kind === 'worn') return 'Worn'
  return 'Base'
}
