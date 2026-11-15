export type Group = 'Food' | 'Getting Around' | 'School' | 'Personal' | 'Fun' | 'Essentials';

export type Category = {
  name: string
  group: Group
}

export type Expense = {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

export type Deposit = {
  id: string
  amount: number
  note: string
  date: string
}

// One row in the activity list. Expenses and deposits both fit this shape
export type Activity = {
  id: string
  kind: 'expense' | 'deposit'
  title: string
  detail: string
  amount: number
  date: string
}
