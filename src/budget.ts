import type { Category, Deposit, Expense, Group } from './types'

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

export function today(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function makeExpense(amount: number, category: string, note: string = ''): Expense {
  if (amount <= 0) {
    throw new Error('Amount must be more than 0')
  }
  if (!getGroup(category)) {
    throw new Error(`Unknown category: ${category}`)
  }

  return {
    id: crypto.randomUUID(),
    amount,
    category,
    note,
    date: today(),
  }
}

export function makeDeposit(amount: number, note: string = ''): Deposit {
  if (amount <= 0) {
    throw new Error('Amount must be more than 0')
  }

  return {
    id: crypto.randomUUID(),
    amount,
    note,
    date: today(),
  }
}

export function totalSpent(expenses: Expense[]): number {
  let total = 0
  for (const e of expenses) {
    total += e.amount
  }
  return total
}

export function totalsByCategory(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount
  }
  return totals
}
