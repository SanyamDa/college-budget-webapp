import type { Expense } from './types'
import { CATEGORIES, getGroup } from './budget'
import { makeExpense, makeDeposit } from './budget'


const test: Expense = {
  id: '1',
  amount: 13,
  category: 'Dining Out',
  note: 'Taste of India',
  date: '2026-11-11',
}

console.log(test)


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>College Budget App</h1>
`
