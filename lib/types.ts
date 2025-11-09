export interface Gear {
  id: string;
  name: string;
  category: GearCategory;
  weight: number; // グラム
  description?: string;
  createdAt: Date;
}

export type GearCategory =
  | 'tent'
  | 'sleeping'
  | 'backpack'
  | 'clothing'
  | 'cooking'
  | 'food'
  | 'water'
  | 'electronics'
  | 'other';

export const CATEGORY_LABELS: Record<GearCategory, string> = {
  tent: 'テント・シェルター',
  sleeping: '寝具',
  backpack: 'バックパック',
  clothing: 'ウェア',
  cooking: '調理器具',
  food: '食料',
  water: '水分',
  electronics: '電子機器',
  other: 'その他',
};

export interface PackingListItem {
  id: string;
  gearId: string;
  quantity: number;
  packed: boolean;
}

export interface PackingList {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  items: PackingListItem[];
  createdAt: Date;
}
