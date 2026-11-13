import type { Deposit, Expense } from './types'

// The names we save the data under
const EXPENSES_KEY = 'budget.expenses'
const DEPOSITS_KEY = 'budget.deposits'

// Save the lists as text
export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
}

export function saveDeposits(deposits: Deposit[]): void {
  localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits))
}

// Load the lists back, or an empty list if nothing is saved yet
export function loadExpenses(): Expense[] {
  const text = localStorage.getItem(EXPENSES_KEY)
  if (text === null) {
    return []
  }
  try {
    return JSON.parse(text)
  } catch {
    console.error('Saved expenses were broken, starting fresh')
    return []
  }
}

export function loadDeposits(): Deposit[] {
  const text = localStorage.getItem(DEPOSITS_KEY)
  if (text === null) {
    return []
  }
  try {
    return JSON.parse(text)
  } catch {
    console.error('Saved deposits were broken, starting fresh')
    return []
  }
}