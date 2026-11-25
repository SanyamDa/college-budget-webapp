Spec:

What v1.0 needs to do, and what's done so far.

The problem:

When I get money it's usually gone in a week and I have no idea where it went without going
through my bank app. I want logging to be quick and I want to see where my money went each month.

Features:

- Log an expense: type the amount, tap a category, date is filled in for me
- Don't allow empty, 0, negative or non-number amounts
- Log money coming in, with an optional note
- Categories split into 6 groups (Food, Getting Around, School, Personal, Fun, Essentials)
- Show money left (all money in minus all money spent)
- Show how much I spent this month
- "Where did it go" for this month, by group, biggest first, with the categories under each group
- List of everything I logged, newest first
- Edit anything I logged (amount, category, note, date)
- Delete anything I logged (asks first)
- Data stays saved after closing the tab (localStorage)
- Pie chart of spending by group (Chart.js)

Other stuff it should be

- Logging an expense takes less than 5 seconds on my phone (works on my laptop, haven't tried on a phone)
- Easy to use on a phone with one hand (looks fine at phone size, haven't tried on a real phone)
- Live on GitHub Pages so I can add it to my home screen
- Dark mode follows my phone's setting
- Doesn't crash on bad data (unknown categories go under "Other", broken saved data starts fresh)
- Nothing leaves my device, no login or server
- I can explain every file and fix bugs on my own (working on it)

Class requirements

- Repo with README, Eisenhower matrix and system diagram
- README is accurate (tech stack still lists libraries I ended up not using)
- One commit per step of the build plan
- Tests for the logic in `budget.ts`

Not doing in v1:

- Safe to spend, auto categories, tags, type-to-log, month history, login/sync, AI logging,
bank connections, receipt scanning. These are in the README under Future Plans.

Changes I made along the way:

- At first "money left" only counted spending since my last deposit. That made leftover money
disappear, so I switched it to a normal balance (money in minus money out) and moved the
breakdown to monthly.
- Everything is on one page instead of separate pages. It's simpler and works better on a phone.
- Dates don't have times, so if two things are logged the same day, the one I added last shows first.
