import { Gear, PackingList } from './types';

const GEARS_KEY = 'ul-packing-gears';
const LISTS_KEY = 'ul-packing-lists';

// Gear storage
export const getGears = (): Gear[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(GEARS_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

export const saveGear = (gear: Gear): void => {
  const gears = getGears();
  const index = gears.findIndex((g) => g.id === gear.id);
  if (index >= 0) {
    gears[index] = gear;
  } else {
    gears.push(gear);
  }
  localStorage.setItem(GEARS_KEY, JSON.stringify(gears));
};

export const deleteGear = (id: string): void => {
  const gears = getGears().filter((g) => g.id !== id);
  localStorage.setItem(GEARS_KEY, JSON.stringify(gears));
};

// Packing list storage
export const getPackingLists = (): PackingList[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LISTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

export const savePackingList = (list: PackingList): void => {
  const lists = getPackingLists();
  const index = lists.findIndex((l) => l.id === list.id);
  if (index >= 0) {
    lists[index] = list;
  } else {
    lists.push(list);
  }
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
};

export const deletePackingList = (id: string): void => {
  const lists = getPackingLists().filter((l) => l.id !== id);
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
};

export const getPackingList = (id: string): PackingList | undefined => {
  return getPackingLists().find((l) => l.id === id);
};
