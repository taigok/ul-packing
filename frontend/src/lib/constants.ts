import type { Category, ItemKind } from '@/lib/types'

type Option<T extends string> = {
  value: T
  label: string
}

const categoryEntries: Array<[Category, string]> = [
  ['shelter', 'シェルター'],
  ['sleeping', 'スリーピング'],
  ['backpack', 'バックパック'],
  ['clothing', '衣類'],
  ['cooking', '調理'],
  ['food', '食料'],
  ['water', '水'],
  ['electronics', '電子機器'],
  ['other', 'その他'],
]

const itemKindEntries: Array<[ItemKind, string]> = [
  ['base', 'ベース'],
  ['consumable', '消耗品'],
  ['worn', '着用'],
]

export const categoryLabels: Record<Category, string> = Object.fromEntries(categoryEntries) as Record<Category, string>
export const itemKindLabels: Record<ItemKind, string> = Object.fromEntries(itemKindEntries) as Record<ItemKind, string>

export const categoryOptions: Array<Option<Category>> = categoryEntries.map(([value, label]) => ({ value, label }))
export const itemKindOptions: Array<Option<ItemKind>> = itemKindEntries.map(([value, label]) => ({ value, label }))
