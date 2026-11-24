import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { LineChartComponent } from '../../components/charts/line-chart.component';
import { DonutChartComponent } from '../../components/charts/donut-chart.component';
import { AppIconComponent } from '../../components/icon/app-icon.component';
import { TimeRange, CategorySummary } from '../../models/finance.models';
import { formatCurrency } from '../../utils/formatters';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LineChartComponent, DonutChartComponent, AppIconComponent],
  template: `
    <div class="animate-in fade-in duration-500">
      <!-- Header & Time Range Filter -->
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60"
      >
        <h1 class="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
          Intelligence
        </h1>
        <div
          class="flex items-center space-x-1 bg-zinc-50 dark:bg-zinc-800/40 p-0.5 rounded-[4px] w-fit"
        >
          @for (r of ['7D', '1M', '3M']; track r) {
            <button
              (click)="timeRange.set($any(r))"
              class="px-3 py-1.5 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer"
              [ngClass]="
                timeRange() === r
                  ? 'bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
              "
            >
              {{ r }}
            </button>
          }
        </div>
      </div>

      <!-- Dynamic Insights Cards -->
      <div
        class="py-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 border-b border-zinc-200/60 dark:border-zinc-800/60"
      >
        <!-- Period Trend -->
        <div
          class="p-4 rounded-[6px] bg-zinc-50/50 dark:bg-[#111] border border-zinc-200/60 dark:border-zinc-800/60"
        >
          <h4
            class="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 font-medium"
          >
            Period Trend
          </h4>
          <p
            class="text-[12px] sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            @if (prevStats().out === 0) {
              Sufficient historical data is not yet available for comparison.
            } @else {
              Outflows are
              <strong class="font-medium text-zinc-900 dark:text-white">
                {{ expenseChange() > 0 ? 'up' : 'down' }}
                {{ absExpenseChange() }}%
              </strong>
              compared to the previous {{ rangeDays() }} days.
            }
          </p>
        </div>

        <!-- Top Category -->
        <div
          class="p-4 rounded-[6px] bg-zinc-50/50 dark:bg-[#111] border border-zinc-200/60 dark:border-zinc-800/60"
        >
          <h4
            class="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 font-medium"
          >
            Top Category
          </h4>
          <p
            class="text-[12px] sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            @if (topCategory()) {
              Your highest spending category is
              <strong class="font-medium text-zinc-900 dark:text-white">
                {{ topCategory()!.name }}
              </strong>, accounting for
              <strong
                class="font-medium tabular-nums text-zinc-900 dark:text-white"
              >
                {{ formatCurrency(topCategory()!.value) }}
              </strong>.
            } @else {
              No categorized expenses found for this period.
            }
          </p>
        </div>

        <!-- Largest Transaction -->
        <div
          class="p-4 rounded-[6px] bg-zinc-50/50 dark:bg-[#111] border border-zinc-200/60 dark:border-zinc-800/60"
        >
          <h4
            class="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 font-medium"
          >
            Largest Transaction
          </h4>
          <p
            class="text-[12px] sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            @if (largestTxn()) {
              The largest isolated expense this period was to
              <strong class="font-medium text-zinc-900 dark:text-white">
                {{ largestTxn()!.merchant }}
              </strong>
              for
              <strong
                class="font-medium tabular-nums text-zinc-900 dark:text-white"
              >
                {{ formatCurrency(largestTxn()!.amount) }}
              </strong>.
            } @else {
              No expense transactions recorded this period.
            }
          </p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div
        class="py-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12"
      >
        <!-- Spend Velocity -->
        <div class="col-span-1 lg:col-span-8">
          <h3
            class="text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-6 sm:mb-8"
          >
            Spend Velocity
          </h3>
          <div class="h-[220px] sm:h-[260px] w-full">
            @if (chartData().length > 0) {
              <app-line-chart
                [data]="chartData()"
                dataKey="amount"
                unitLabel="Spend"
              />
            } @else {
              <div
                class="h-full w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-400 dark:text-zinc-600"
              >
                <app-icon name="bar-chart-2" class="w-6 h-6 mb-2 opacity-20" />
                <span class="text-[12px]"
                  >No spend velocity data available.</span
                >
              </div>
            }
          </div>
        </div>

        <!-- Allocation -->
        <div class="col-span-1 lg:col-span-4 flex flex-col">
          <h3
            class="text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold mb-6 sm:mb-8"
          >
            Allocation
          </h3>
          <div class="h-[160px] w-full mb-8">
            @if (catData().length > 0) {
              <app-donut-chart
                [data]="catData()"
                [innerRadius]="50"
                [outerRadius]="70"
              />
            } @else {
              <div
                class="h-full w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-400 dark:text-zinc-600"
              >
                <app-icon name="pie-chart" class="w-6 h-6 mb-2 opacity-20" />
                <span class="text-[12px]">No allocation data.</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  readonly store = inject(FinanceStoreService);

  readonly timeRange = signal<TimeRange>('1M');

  readonly rangeDays = computed(() => {
    const r = this.timeRange();
    return r === '7D' ? 7 : r === '1M' ? 30 : 90;
  });

  readonly cutoff = computed(() => {
    return new Date(new Date().getTime() - this.rangeDays() * 24 * 60 * 60 * 1000);
  });

  readonly prevCutoff = computed(() => {
    return new Date(
      this.cutoff().getTime() - this.rangeDays() * 24 * 60 * 60 * 1000
    );
  });

  readonly currentTxns = computed(() => {
    const cut = this.cutoff();
    return this.store.transactions().filter((t) => new Date(t.date) >= cut);
  });

  readonly prevTxns = computed(() => {
    const cut = this.cutoff();
    const prevCut = this.prevCutoff();
    return this.store
      .transactions()
      .filter((t) => new Date(t.date) >= prevCut && new Date(t.date) < cut);
  });

  readonly stats = computed(() => {
    return this.currentTxns().reduce(
      (acc, t) => {
        if (t.type === 'income') acc.in += t.amount;
        else acc.out += t.amount;
        return acc;
      },
      { in: 0, out: 0 }
    );
  });

  readonly prevStats = computed(() => {
    return this.prevTxns().reduce(
      (acc, t) => {
        if (t.type === 'income') acc.in += t.amount;
        else acc.out += t.amount;
        return acc;
      },
      { in: 0, out: 0 }
    );
  });

  readonly chartData = computed(() => {
    const daily = this.currentTxns().reduce<Record<string, number>>((acc, t) => {
      if (t.type === 'expense') {
        acc[t.date] = (acc[t.date] || 0) + t.amount;
      }
      return acc;
    }, {});

    return Object.entries(daily)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly catData = computed<CategorySummary[]>(() => {
    const grouped = this.currentTxns()
      .filter((t) => t.type === 'expense')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  readonly expenseChange = computed(() => {
    const prevOut = this.prevStats().out;
    const curOut = this.stats().out;
    if (prevOut === 0) return 0;
    return ((curOut - prevOut) / prevOut) * 100;
  });

  readonly absExpenseChange = computed(() => {
    return Math.abs(this.expenseChange()).toFixed(1);
  });

  readonly topCategory = computed(() => {
    const cats = this.catData();
    return cats.length > 0 ? cats[0] : null;
  });

  readonly largestTxn = computed(() => {
    return this.currentTxns()
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0] || null;
  });

  formatCurrency(val: number): string {
    return formatCurrency(val);
  }
}
