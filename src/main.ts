import { makeExpense, makeDeposit, sinceLastDeposit } from './budget'
import { loadExpenses, loadDeposits, saveExpenses, saveDeposits } from './storage'

const expenses = loadExpenses()
const deposits = loadDeposits()

console.log('Loaded', expenses.length, 'expenses and', deposits.length, 'deposits')

// Add one test expense every time the page loads
expenses.push(makeExpense(4, 'Veo'))
saveExpenses(expenses)

// Add a deposit only the very first time
if (deposits.length === 0) {
  deposits.push(makeDeposit(300, 'From parents'))
  saveDeposits(deposits)
}

console.log(sinceLastDeposit(expenses, deposits))


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>College Budget App</h1>
`
