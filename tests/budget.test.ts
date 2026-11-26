import { describe, expect, test } from 'vitest'
import {
  biggestExpenses,
  checkAmount,
  currentMonth,
  dailyTotals,
  earliestMonth,
  expensesInMonth,
  getActivity,
  getBalance,
  getGroup,
  makeDeposit,
  makeExpense,
  shiftMonth,
  today,
  totalDeposited,
  totalsByCategory,
  totalsByGroup,
  totalSpent,
} from '../src/budget'
import type { Deposit, Expense } from '../src/types'

// Quick helpers to make test data with a fixed date
let nextId = 0
function expense(amount: number, category: string, date: string, note = ''): Expense {
  nextId += 1
  return { id: `e${nextId}`, amount, category, note, date }
}
function deposit(amount: number, date: string, note = ''): Deposit {
  nextId += 1
  return { id: `d${nextId}`, amount, note, date }
}

describe('getGroup', () => {
  test('finds the group for a category', () => {
    expect(getGroup('Veo')).toBe('Getting Around')
    expect(getGroup('Dining Out')).toBe('Food')
  })

  test('gives undefined for a category that does not exist', () => {
    expect(getGroup('Pizza')).toBeUndefined()
  })
})

describe('checkAmount', () => {
  test('allows normal amounts', () => {
    expect(() => checkAmount(4.5)).not.toThrow()
  })

  test('blocks 0, negatives, NaN and Infinity', () => {
    expect(() => checkAmount(0)).toThrow('Amount must be more than 0')
    expect(() => checkAmount(-5)).toThrow()
    expect(() => checkAmount(NaN)).toThrow()
    expect(() => checkAmount(Infinity)).toThrow()
  })
})

describe('makeExpense and makeDeposit', () => {
  test('makeExpense fills in the id and today\'s date', () => {
    const e = makeExpense(13, 'Dining Out', 'Taste of India')
    expect(e.amount).toBe(13)
    expect(e.category).toBe('Dining Out')
    expect(e.note).toBe('Taste of India')
    expect(e.date).toBe(today())
    expect(e.id).not.toBe('')
  })

  test('two expenses never get the same id', () => {
    expect(makeExpense(4, 'Veo').id).not.toBe(makeExpense(4, 'Veo').id)
  })

  test('makeExpense blocks unknown categories and bad amounts', () => {
    expect(() => makeExpense(5, 'Pizza')).toThrow('Unknown category: Pizza')
    expect(() => makeExpense(-1, 'Veo')).toThrow()
  })

  test('makeDeposit works and blocks bad amounts', () => {
    expect(makeDeposit(300, 'From parents').amount).toBe(300)
    expect(() => makeDeposit(0)).toThrow()
  })
})

describe('totals', () => {
  const expenses = [
    expense(13, 'Dining Out', '2026-11-09'),
    expense(4, 'Veo', '2026-11-10'),
    expense(4, 'Veo', '2026-11-11'),
    expense(10, 'Laundry', '2026-11-12'),
  ]

  test('totalSpent adds everything up', () => {
    expect(totalSpent(expenses)).toBe(31)
  })

  test('totalSpent of nothing is 0', () => {
    expect(totalSpent([])).toBe(0)
  })

  test('totalsByCategory adds up each category on its own', () => {
    expect(totalsByCategory(expenses)).toEqual({ 'Dining Out': 13, Veo: 8, Laundry: 10 })
  })

  test('totalDeposited adds up all the money in', () => {
    expect(totalDeposited([deposit(200, '2026-11-01'), deposit(300, '2026-11-08')])).toBe(500)
  })
})

describe('getBalance', () => {
  test('is all money in minus all money out, and never forgets leftover money', () => {
    // The example that made me change the logic: $500 in, $32 out = $468
    const deposits = [deposit(200, '2026-11-01'), deposit(300, '2026-11-08')]
    const expenses = [
      expense(15, 'Clothes', '2026-11-03'),
      expense(13, 'Dining Out', '2026-11-09'),
      expense(4, 'Veo', '2026-11-10'),
    ]
    expect(getBalance(expenses, deposits)).toBe(468)
  })

  test('can go below zero', () => {
    expect(getBalance([expense(50, 'Clothes', '2026-11-03')], [deposit(20, '2026-11-01')])).toBe(-30)
  })
})

describe('months', () => {
  test('currentMonth looks like "2026-11"', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/)
    expect(today().startsWith(currentMonth())).toBe(true)
  })

  test('expensesInMonth only keeps that month', () => {
    const october = expense(30, 'Dining Out', '2026-10-31')
    const november = expense(10, 'Veo', '2026-11-01')
    expect(expensesInMonth([october, november], '2026-11')).toEqual([november])
  })

  test('shiftMonth moves forward and back, across years too', () => {
    expect(shiftMonth('2026-11', -1)).toBe('2026-10')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2027-01', -1)).toBe('2026-12')
  })

  test('earliestMonth finds the oldest month with an expense', () => {
    const list = [expense(5, 'Veo', '2026-11-02'), expense(5, 'Veo', '2026-09-15'), expense(5, 'Veo', '2026-10-01')]
    expect(earliestMonth(list)).toBe('2026-09')
  })

  test('earliestMonth with no expenses is this month', () => {
    expect(earliestMonth([])).toBe(currentMonth())
  })
})

describe('getActivity', () => {
  test('mixes expenses and deposits, newest first, with spending as negative', () => {
    const activity = getActivity(
      [expense(13, 'Dining Out', '2026-11-09')],
      [deposit(300, '2026-11-01'), deposit(50, '2026-11-20')],
    )
    expect(activity.map((a) => a.date)).toEqual(['2026-11-20', '2026-11-09', '2026-11-01'])
    expect(activity[1].amount).toBe(-13)
    expect(activity[1].kind).toBe('expense')
  })

  test('on the same day, the one added last shows first', () => {
    const first = expense(10, 'Laundry', '2026-11-15')
    const second = expense(6.5, 'Snacks & Coffee', '2026-11-15')
    const activity = getActivity([first, second], [])
    expect(activity[0].id).toBe(second.id)
  })
})

describe('totalsByGroup', () => {
  test('groups categories, biggest group first, biggest category first', () => {
    const groups = totalsByGroup([
      expense(13, 'Dining Out', '2026-11-09'),
      expense(22, 'Dining Out', '2026-11-13'),
      expense(6.5, 'Snacks & Coffee', '2026-11-15'),
      expense(10, 'Laundry', '2026-11-15'),
      expense(8, 'Veo', '2026-11-10'),
    ])
    expect(groups.map((g) => g.group)).toEqual(['Food', 'Essentials', 'Getting Around'])
    expect(groups[0].total).toBe(41.5)
    expect(groups[0].categories).toEqual([
      { name: 'Dining Out', total: 35 },
      { name: 'Snacks & Coffee', total: 6.5 },
    ])
  })

  test('puts unknown categories in "Other" instead of crashing', () => {
    const groups = totalsByGroup([expense(3, 'Target', '2026-11-03')])
    expect(groups[0].group).toBe('Other')
  })

  test('no expenses means no groups', () => {
    expect(totalsByGroup([])).toEqual([])
  })
})

describe('biggestExpenses', () => {
  const list = [
    expense(4, 'Veo', '2026-11-01'),
    expense(65, 'Room Stuff', '2026-11-10'),
    expense(21, 'Travel', '2026-11-06'),
    expense(10, 'Laundry', '2026-11-06'),
  ]

  test('gives the biggest ones, biggest first', () => {
    expect(biggestExpenses(list, 2).map((e) => e.amount)).toEqual([65, 21])
  })

  test('does not reorder the original list', () => {
    biggestExpenses(list, 2)
    expect(list.map((e) => e.amount)).toEqual([4, 65, 21, 10])
  })

  test('works when there are fewer than asked for', () => {
    expect(biggestExpenses(list, 10)).toHaveLength(4)
  })
})

describe('dailyTotals', () => {
  test('has one slot per day of the month', () => {
    expect(dailyTotals([], '2026-11')).toHaveLength(30)
    expect(dailyTotals([], '2026-12')).toHaveLength(31)
    expect(dailyTotals([], '2027-02')).toHaveLength(28)
    expect(dailyTotals([], '2028-02')).toHaveLength(29) // leap year
  })

  test('puts each expense on its day and ignores other months', () => {
    const totals = dailyTotals(
      [
        expense(4, 'Veo', '2026-11-01'),
        expense(9.04, 'Dining Out', '2026-11-06'),
        expense(10, 'Laundry', '2026-11-06'),
        expense(40, 'Clothes', '2026-10-28'),
      ],
      '2026-11',
    )
    expect(totals[0]).toBe(4) // Nov 1
    expect(totals[5]).toBeCloseTo(19.04) // Nov 6
    expect(totals[27]).toBe(0) // Nov 28, the October expense is not counted
  })
})
