import type { Expense } from './types'
import { CATEGORIES, getGroup } from './budget'

const test: Expense = {
  id: '1',
  amount: 13,
  category: 'Dining Out',
  note: 'Taste of India',
  date: '2026-11-11',
}

console.log(test)
console.log(CATEGORIES.length)
console.log(getGroup('Veo'))
console.log(getGroup('Pizza'))

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>College Budget App</h1>
`
