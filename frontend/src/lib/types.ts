export type Unit = 'g' | 'oz'

export type Category =
  | 'shelter'
  | 'sleeping'
  | 'backpack'
  | 'clothing'
  | 'cooking'
  | 'food'
  | 'water'
  | 'electronics'
  | 'other'

export type ItemKind = 'base' | 'consumable' | 'worn'

export type Summary = {
  base_weight_g: number
  consumable_weight_g: number
  worn_weight_g: number
  total_pack_g: number
}

export type GearItem = {
  id: string
  list_id: string
  name: string
  category: Category
  weight_grams: number
  quantity: number
  kind: ItemKind
  notes: string
  sort_order: number
}

export type GearListItem = {
  id: string
  list_id: string
  list_title: string
  name: string
  category: Category
  kind: ItemKind
  weight_grams: number
  quantity: number
  notes: string
  sort_order: number
}

export type PackingList = {
  id: string
  title: string
  description: string
  unit: Unit
  share_token: string
  is_shared: boolean
  created_at: string
  updated_at: string
}

export type PackingListDetail = PackingList & {
  items: GearItem[]
  summary: Summary
}

export type SharedPackingList = {
  id: string
  title: string
  description: string
  unit: Unit
  items: GearItem[]
  summary: Summary
}

export type ApiErrorBody = {
  code: string
  message: string
  details?: unknown
}
