/**
 * Global Lottery Configuration
 * Strictly defines the relationship between Time Slots and Lottery Brands
 */

export const DRAW_SLOTS = [
  { time: '01:00 PM', brand: 'DEAR', id: 1 },
  { time: '03:00 PM', brand: 'KERALA', id: 4 },
  { time: '06:00 PM', brand: 'DEAR', id: 2 },
  { time: '08:00 PM', brand: 'DEAR', id: 3 }
];

export const getBrandBySlot = (time) => {
  const slot = DRAW_SLOTS.find(s => s.time === time);
  return slot ? slot.brand : 'UNKNOWN';
};

export const getSlotById = (id) => {
  return DRAW_SLOTS.find(s => s.id === Number(id));
};

export const MARKET_GROUPS = {
  'DEAR': ['01:00 PM', '06:00 PM', '08:00 PM'],
  'KERALA': ['03:00 PM']
};
