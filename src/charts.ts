import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'

// Chart.js only includes the pieces we register, which keeps the app small
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

// The chart currently on screen, so we can throw it away before drawing a new one
let dailyChart: Chart<'bar'> | null = null

// Read a color from our CSS variables, like "--accent"
function cssColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Draw a bar for every day of the month. totals[0] is day 1
export function drawDailyChart(canvas: HTMLCanvasElement, totals: number[]): void {
  const labels = totals.map((_, i) => String(i + 1))

  // A chart can't be drawn on a canvas that already has one, so remove the old one
  dailyChart?.destroy()

  dailyChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: totals, backgroundColor: cssColor('--accent'), borderRadius: 4 }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => `Day ${items[0].label}`,
            label: (item) => '$' + Number(item.raw).toFixed(2),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: cssColor('--muted'), maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        },
        y: {
          beginAtZero: true,
          grid: { color: cssColor('--border') },
          ticks: { color: cssColor('--muted'), callback: (value) => '$' + value },
        },
      },
    },
  })
}
