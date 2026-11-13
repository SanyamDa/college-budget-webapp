import { makeExpense, totalSpent, totalsByCategory } from './budget'

const expenses = [
  makeExpense(13, 'Dining Out', 'Taste of India'),
  makeExpense(4, 'Veo'),
  makeExpense(4, 'Veo'),
  makeExpense(10, 'Laundry'),
]

console.log(totalSpent(expenses))
console.log(totalsByCategory(expenses))


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>College Budget App</h1>
`
