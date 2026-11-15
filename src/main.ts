import { CATEGORIES, makeDeposit, makeExpense, sinceLastDeposit } from './budget'
import { loadDeposits, loadExpenses, saveDeposits, saveExpenses } from './storage'

// The app's data, loaded once when the page opens
const expenses = loadExpenses()
const deposits = loadDeposits()

// Summary card
const leftEl = document.getElementById('left')!
const noteEl = document.getElementById('summary-note')!

// Expense form
const amountInput = document.getElementById('amount') as HTMLInputElement
const noteInput = document.getElementById('note') as HTMLInputElement
const buttonsEl = document.getElementById('category-buttons')!
const errorEl = document.getElementById('error')!

// Deposit form
const depositAmountInput = document.getElementById('deposit-amount') as HTMLInputElement
const depositNoteInput = document.getElementById('deposit-note') as HTMLInputElement
const depositButton = document.getElementById('log-deposit')!
const depositErrorEl = document.getElementById('deposit-error')!

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

// Runs when you tap a category button
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

// Runs when you tap "Add money"
function logDeposit(): void {
  try {
    const amount = Number(depositAmountInput.value)
    const deposit = makeDeposit(amount, depositNoteInput.value)
    deposits.push(deposit)
    saveDeposits(deposits)

    // Clear the form for next time
    depositAmountInput.value = ''
    depositNoteInput.value = ''
    depositErrorEl.textContent = ''
    render()
  } catch (err) {
    depositErrorEl.textContent = (err as Error).message
  }
}

// Make one button per category
for (const category of CATEGORIES) {
  const button = document.createElement('button')
  button.textContent = category.name
  button.addEventListener('click', () => logExpense(category.name))
  buttonsEl.appendChild(button)
}

// Hook up the deposit button
depositButton.addEventListener('click', logDeposit)

render()
