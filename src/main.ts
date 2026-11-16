import './style.css'
import {
  CATEGORIES,
  checkAmount,
  currentMonth,
  expensesInMonth,
  getActivity,
  getBalance,
  makeDeposit,
  makeExpense,
  totalSpent,
  totalsByGroup,
} from './budget'
import { loadDeposits, loadExpenses, saveDeposits, saveExpenses } from './storage'
import type { Activity } from './types'

// The app's data, loaded once when the page opens
const expenses = loadExpenses()
const deposits = loadDeposits()

// Summary card
const leftEl = document.getElementById('left')!
const noteEl = document.getElementById('summary-note')!

// Where did it go
const breakdownTitleEl = document.getElementById('breakdown-title')!
const breakdownTotalEl = document.getElementById('breakdown-total')!
const breakdownEl = document.getElementById('breakdown')!
const breakdownEmptyEl = document.getElementById('breakdown-empty')!

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

// Edit popup
const editDialog = document.getElementById('edit-dialog') as HTMLDialogElement
const editForm = document.getElementById('edit-form') as HTMLFormElement
const editTitleEl = document.getElementById('edit-title')!
const editAmountInput = document.getElementById('edit-amount') as HTMLInputElement
const editCategoryLabel = document.getElementById('edit-category-label')!
const editCategorySelect = document.getElementById('edit-category') as HTMLSelectElement
const editNoteInput = document.getElementById('edit-note') as HTMLInputElement
const editDateInput = document.getElementById('edit-date') as HTMLInputElement
const editErrorEl = document.getElementById('edit-error')!
const editCancelButton = document.getElementById('edit-cancel')!

// The row being edited right now, or null when the popup is closed
let editing: Activity | null = null

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

// Turn "2026-11" into "November"
function monthName(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'long' })
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
  renderBreakdown()
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

// The "Where did it go" card: this month's spending by group
function renderBreakdown(): void {
  const month = currentMonth()
  const monthExpenses = expensesInMonth(expenses, month)
  const spent = totalSpent(monthExpenses)
  const groups = totalsByGroup(monthExpenses)

  breakdownTitleEl.textContent = `Where did it go · ${monthName(month)}`
  breakdownTotalEl.textContent = money(spent)

  // Wipe the old rows, then build them again from the data
  breakdownEl.replaceChildren()
  breakdownEmptyEl.hidden = groups.length > 0

  for (const g of groups) {
    const percent = Math.round((g.total / spent) * 100)

    const header = makeEl('div', 'breakdown-header', '')
    header.append(
      makeEl('span', 'breakdown-group', g.group),
      makeEl('span', 'breakdown-amount', `${money(g.total)} · ${percent}%`),
    )

    // The bar: a gray track with a colored part as wide as the percent
    const fill = makeEl('div', 'bar-fill', '')
    fill.style.width = `${percent}%`
    const bar = makeEl('div', 'bar', '')
    bar.append(fill)

    // "Dining Out $13.00 · Snacks & Coffee $6.50"
    const categoryText = g.categories.map((c) => `${c.name} ${money(c.total)}`).join(' · ')

    const row = document.createElement('li')
    row.append(header, bar, makeEl('p', 'breakdown-categories', categoryText))
    breakdownEl.appendChild(row)
  }
}

// The "Recent activity" list
function renderActivity(): void {
  const activity = getActivity(expenses, deposits)

  // Wipe the old rows, then build them again from the data
  activityEl.replaceChildren()
  activityEmptyEl.hidden = activity.length > 0

  for (const item of activity) {
    const detail = item.detail ? `${prettyDate(item.date)} · ${item.detail}` : prettyDate(item.date)
    const text = makeEl('button', 'activity-text', '')
    text.append(makeEl('span', 'activity-title', item.title), makeEl('span', 'activity-detail', detail))
    text.addEventListener('click', () => openEdit(item))

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

// Runs when you tap a row: fill the popup with that row's data and open it
function openEdit(item: Activity): void {
  editing = item
  editTitleEl.textContent = item.kind === 'expense' ? 'Edit expense' : 'Edit money in'
  editAmountInput.value = String(Math.abs(item.amount))
  editNoteInput.value = item.detail
  editDateInput.value = item.date
  editErrorEl.textContent = ''

  // Deposits don't have a category, so hide that box for them
  editCategoryLabel.hidden = item.kind !== 'expense'
  if (item.kind === 'expense') {
    editCategorySelect.value = item.title // for expenses, the title is the category
  }

  editDialog.showModal()
}

// Runs when you tap Save in the popup
function saveEdit(event: SubmitEvent): void {
  event.preventDefault() // stop the browser from reloading the page

  const item = editing
  if (!item) {
    return
  }

  try {
    const amount = Number(editAmountInput.value)
    checkAmount(amount)
    if (editDateInput.value === '') {
      throw new Error('Pick a date')
    }

    if (item.kind === 'expense') {
      const expense = expenses.find((e) => e.id === item.id)
      if (expense) {
        expense.amount = amount
        expense.category = editCategorySelect.value
        expense.note = editNoteInput.value
        expense.date = editDateInput.value
        saveExpenses(expenses)
      }
    } else {
      const deposit = deposits.find((d) => d.id === item.id)
      if (deposit) {
        deposit.amount = amount
        deposit.note = editNoteInput.value
        deposit.date = editDateInput.value
        saveDeposits(deposits)
      }
    }

    editDialog.close()
    render()
  } catch (err) {
    editErrorEl.textContent = (err as Error).message
  }
}

// Fill the popup's category dropdown, one option per category
for (const category of CATEGORIES) {
  const option = document.createElement('option')
  option.value = category.name
  option.textContent = category.name
  editCategorySelect.appendChild(option)
}

// Hook up the popup's buttons
editForm.addEventListener('submit', saveEdit)
editCancelButton.addEventListener('click', () => editDialog.close())
editDialog.addEventListener('close', () => {
  editing = null
})

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
