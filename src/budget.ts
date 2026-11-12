import type { Category, Group } from './types'

export const CATEGORIES: Category[] = [
  { name: 'Dining Out', group: 'Food' },
  { name: 'Snacks & Coffee', group: 'Food' },
  { name: 'Groceries', group: 'Food' },
  { name: 'Veo', group: 'Getting Around' },
  { name: 'Uber', group: 'Getting Around' },
  { name: 'Travel', group: 'Getting Around' },
  { name: 'Books', group: 'School' },
  { name: 'Supplies', group: 'School' },
  { name: 'Clothes', group: 'Personal' },
  { name: 'Room Stuff', group: 'Personal' },
  { name: 'Events', group: 'Fun' },
  { name: 'Going Out', group: 'Fun' },
  { name: 'Subscriptions', group: 'Fun' },
  { name: 'Laundry', group: 'Essentials' },
  { name: 'Medicine', group: 'Essentials' },
  { name: 'Toiletries', group: 'Essentials' },
]


export function getGroup(categoryName: string): Group | undefined {
  const match = CATEGORIES.find((c) => c.name === categoryName)
  return match?.group
}