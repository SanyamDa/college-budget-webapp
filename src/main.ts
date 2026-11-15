import { CATEGORIES, makeExpense, sinceLastDeposit } from './budget'
import { loadExpenses, loadDeposits, saveExpenses } from './storage'

// The app's data, loaded once when the page opens
const expenses = loadExpenses()
const deposits = loadDeposits()

// Find the elements on the page we want to update
const leftEl = document.getElementById('left')!
const noteEl = document.getElementById('summary-note')!
const amountInput = document.getElementById('amount') as HTMLInputElement // NEW
const noteInput = document.getElementById('note') as HTMLInputElement // NEW
const buttonsEl = document.getElementById('category-buttons')! // NEW
const errorEl = document.getElementById('error')! // NEW

// Turn 4 into "$4.00"
function money(amount: number): string {
  return '$' + amount.toFixed(2)
}

// Redraw the page from the data
function render(): void {
  const summary = sinceLastDeposit(expenses, deposits)

  if (!summary) {
    leftEl.textContent = money(0)
    noteEl.textContent = 'Log some money coming in to get started'
    return
  }

  leftEl.textContent = money(summary.left)
  noteEl.textContent = `Spent ${money(summary.spent)} of ${money(summary.deposit.amount)} since ${summary.deposit.date}`
}

// NEW: runs when you tap a category button
function logExpense(categoryName: string): void {
  try {
    const amount = Number(amountInput.value)
    const expense = makeExpense(amount, categoryName, noteInput.value)
    expenses.push(expense)
    saveExpenses(expenses)

    // Clear the form for the next expense
    amountInput.value = ''
    noteInput.value = ''
    errorEl.textContent = ''
    render()
  } catch (err) {
    errorEl.textContent = (err as Error).message
  }
}

// NEW: make one button per category
for (const category of CATEGORIES) {
  const button = document.createElement('button')
  button.textContent = category.name
  button.addEventListener('click', () => logExpense(category.name))
  buttonsEl.appendChild(button)
}

render()