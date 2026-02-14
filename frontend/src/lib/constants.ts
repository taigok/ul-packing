import type { Category, ItemKind } from '@/lib/types'

export const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: 'shelter', label: 'Shelter' },
  { value: 'sleeping', label: 'Sleeping' },
  { value: 'backpack', label: 'Backpack' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'food', label: 'Food' },
  { value: 'water', label: 'Water' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
]

export const itemKindOptions: Array<{ value: ItemKind; label: string }> = [
  { value: 'base', label: 'Base' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'worn', label: 'Worn' },
]
