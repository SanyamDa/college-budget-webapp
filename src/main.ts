import './style.css'
import {
  CATEGORIES,
  currentMonth,
  expensesInMonth,
  getActivity,
  getBalance,
  makeDeposit,
  makeExpense,
  totalSpent,
} from './budget'
import { loadDeposits, loadExpenses, saveDeposits, saveExpenses } from './storage'
import type { Activity } from './types'

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

// Activity list
const activityEl = document.getElementById('activity')!
const activityEmptyEl = document.getElementById('activity-empty')!

// Turn 4 into "$4.00" and -3 into "-$3.00"
function money(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return sign + '$' + Math.abs(amount).toFixed(2)
}

// Turn "2026-11-15" into "Nov 15"
function prettyDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Make an element with a class and some text
function makeEl(tag: string, className: string, text: string): HTMLElement {
  const el = document.createElement(tag)
  el.className = className
  el.textContent = text
  return el
}

// Redraw the whole page from the data
function render(): void {
  renderSummary()
  renderActivity()
}

// The big "Money left" card
function renderSummary(): void {
  if (deposits.length === 0) {
    leftEl.textContent = money(0)
    leftEl.classList.remove('negative')
    noteEl.textContent = 'Log some money coming in to get started'
    return
  }

  const monthExpenses = expensesInMonth(expenses, currentMonth())

  const balance = getBalance(expenses, deposits)

  leftEl.textContent = money(balance)
  leftEl.classList.toggle('negative', balance < 0)
  noteEl.textContent = `Spent ${money(totalSpent(monthExpenses))} this month`
}

// The "Recent activity" list
function renderActivity(): void {
  const activity = getActivity(expenses, deposits)

  // Wipe the old rows, then build them again from the data
  activityEl.replaceChildren()
  activityEmptyEl.hidden = activity.length > 0

  for (const item of activity) {
    const detail = item.detail ? `${prettyDate(item.date)} · ${item.detail}` : prettyDate(item.date)
    const text = makeEl('div', 'activity-text', '')
    text.append(makeEl('p', 'activity-title', item.title), makeEl('p', 'activity-detail', detail))

    const sign = item.amount > 0 ? '+' : ''
    const amount = makeEl('p', 'activity-amount', sign + money(item.amount))

    const deleteButton = makeEl('button', 'delete', '✕')
    deleteButton.setAttribute('aria-label', `Delete ${item.title}`)
    deleteButton.addEventListener('click', () => deleteActivity(item))

    const row = document.createElement('li')
    row.classList.add(item.kind)
    row.append(text, amount, deleteButton)
    activityEl.appendChild(row)
  }
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

// Runs when you tap ✕ on a row
function deleteActivity(item: Activity): void {
  if (!confirm(`Delete ${item.title} (${money(Math.abs(item.amount))})?`)) {
    return
  }

  if (item.kind === 'expense') {
    const index = expenses.findIndex((e) => e.id === item.id)
    if (index !== -1) {
      expenses.splice(index, 1)
      saveExpenses(expenses)
    }
  } else {
    const index = deposits.findIndex((d) => d.id === item.id)
    if (index !== -1) {
      deposits.splice(index, 1)
      saveDeposits(deposits)
    }
  }

  render()
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
