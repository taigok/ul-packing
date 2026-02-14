import type { Category, ItemKind } from '@/lib/types'

export const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: 'shelter', label: 'シェルター' },
  { value: 'sleeping', label: 'スリーピング' },
  { value: 'backpack', label: 'バックパック' },
  { value: 'clothing', label: '衣類' },
  { value: 'cooking', label: '調理' },
  { value: 'food', label: '食料' },
  { value: 'water', label: '水' },
  { value: 'electronics', label: '電子機器' },
  { value: 'other', label: 'その他' },
]

export const itemKindOptions: Array<{ value: ItemKind; label: string }> = [
  { value: 'base', label: 'ベース' },
  { value: 'consumable', label: '消耗品' },
  { value: 'worn', label: '着用' },
]
