import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { LineChartComponent } from '../../components/charts/line-chart.component';
import { DonutChartComponent } from '../../components/charts/donut-chart.component';
import { AppIconComponent } from '../../components/icon/app-icon.component';
import { formatCurrency } from '../../utils/formatters';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LineChartComponent, DonutChartComponent, AppIconComponent],
  template: `
    <div class="animate-in fade-in duration-500">
      <!-- Section 1: Net Position & MTD Stats -->
      <section
        class="flex flex-col lg:flex-row justify-between items-start pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
      >
        <div class="mb-8 lg:mb-0 max-w-sm w-full">
          <h2
            class="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2 font-semibold tracking-widest uppercase"
          >
            Net Position
          </h2>
          <h1
            class="text-4xl sm:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white tabular-nums mb-3 leading-none"
          >
            {{ formatCurrency(store.totalBalance()) }}
          </h1>
          <p class="text-[12px] text-zinc-500">
            Current operating capital. Liquid reserves stable.
          </p>
        </div>

        <div class="flex flex-row w-full lg:w-auto gap-4">
          <div
            class="flex-1 sm:w-36 p-4 rounded-[6px] border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-[#111]"
          >
            <span
              class="block text-[10px] sm:text-[11px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wider"
              >MTD Inflows</span
            >
            <span
              class="block text-[14px] sm:text-[16px] font-medium text-zinc-900 dark:text-zinc-100 tabular-nums"
              >{{ formatCurrency(store.currentStats().in) }}</span
            >
          </div>
          <div
            class="flex-1 sm:w-36 p-4 rounded-[6px] border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-[#111]"
          >
            <span
              class="block text-[10px] sm:text-[11px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wider"
              >MTD Outflows</span
            >
            <span
              class="block text-[14px] sm:text-[16px] font-medium text-zinc-900 dark:text-zinc-100 tabular-nums"
              >{{ formatCurrency(store.currentStats().out) }}</span
            >
          </div>
        </div>
      </section>

      <!-- Section 2: Trend & Allocation Charts -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 py-10">
        <!-- 14D Trend Chart -->
        <div class="col-span-1 lg:col-span-8 flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <h3
              class="text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold"
            >
              Net Flow Trend (14D)
            </h3>
          </div>
          <div class="h-[220px] sm:h-[240px] w-full mt-auto">
            @if (store.netFlow14D().length > 0) {
              <app-line-chart
                [data]="store.netFlow14D()"
                dataKey="balance"
                unitLabel="Net"
              />
            } @else {
              <div
                class="h-full w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[6px] text-zinc-400 dark:text-zinc-600"
              >
                <app-icon name="bar-chart-2" class="w-6 h-6 mb-2 opacity-20" />
                <span class="text-[12px]">No trend data.</span>
              </div>
            }
          </div>
        </div>

        <!-- Spend Allocation Pie Chart -->
        <div class="col-span-1 lg:col-span-4 flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <h3
              class="text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold"
            >
              Spend Allocation
            </h3>
          </div>

          <div class="h-[180px] w-full mb-6">
            @if (store.spendAllocation().length > 0) {
              <app-donut-chart
                [data]="store.spendAllocation()"
                [innerRadius]="55"
                [outerRadius]="75"
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

          <div class="space-y-4">
            @for (cat of topCategories(); track cat.name; let i = $index) {
              <div
                class="flex justify-between items-center text-[12px]"
              >
                <div class="flex items-center">
                  <div
                    class="w-2 h-2 rounded-full mr-3 shrink-0"
                    [style.background-color]="pieColors()[i % pieColors().length]"
                  ></div>
                  <span class="text-zinc-600 dark:text-zinc-400 truncate pr-4">{{
                    cat.name
                  }}</span>
                </div>
                <span
                  class="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums"
                  >{{ formatCurrency(cat.value) }}</span
                >
              </div>
            }
          </div>
        </div>
      </section>
    </div>
  `
})
export class DashboardComponent {
  readonly store = inject(FinanceStoreService);

  readonly pieColors = computed(() =>
    this.store.darkMode()
      ? ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46']
      : ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7']
  );

  readonly topCategories = computed(() => {
    return this.store.spendAllocation().slice(0, 3);
  });

  formatCurrency(val: number): string {
    return formatCurrency(val);
  }
}
