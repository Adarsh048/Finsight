import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppButtonComponent } from '../../components/button/app-button.component';
import { AppIconComponent } from '../../components/icon/app-icon.component';
import { exportData } from '../../utils/export';
import { formatCurrency } from '../../utils/formatters';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, AppButtonComponent, AppIconComponent],
  template: `
    <div class="animate-in fade-in duration-500 h-full flex flex-col">
      <!-- Header -->
      <div class="pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <h1 class="text-xl font-medium tracking-tight text-zinc-900 dark:text-white">
          Statements
        </h1>
      </div>

      <div
        class="flex flex-col lg:flex-row mt-6 sm:mt-8 flex-1 gap-8 sm:gap-12"
      >
        <!-- Left Filter Sidebar -->
        <div
          class="w-full lg:w-64 flex flex-col space-y-6 sm:space-y-8 lg:border-r border-zinc-200/60 dark:border-zinc-800/60 pr-0 lg:pr-10 shrink-0"
        >
          <!-- Period Selector -->
          <div>
            <label
              class="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-3"
              >Period</label
            >
            <div class="flex flex-col space-y-1.5">
              @for (r of ['7D', '1M', '3M']; track r) {
                <button
                  (click)="reportRange.set(r)"
                  class="text-left px-3 py-2 text-[12px] rounded-[4px] transition-colors cursor-pointer"
                  [ngClass]="
                    reportRange() === r
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  "
                >
                  {{
                    r === '7D'
                      ? 'Last 7 Days'
                      : r === '1M'
                        ? 'Last 30 Days'
                        : 'Last 90 Days'
                  }}
                </button>
              }
            </div>
          </div>

          <!-- Transaction Type Selector -->
          <div>
            <label
              class="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-3"
              >Transaction Type</label
            >
            <div class="flex flex-col space-y-1.5">
              @for (t of ['all', 'income', 'expense']; track t) {
                <button
                  (click)="reportType.set(t)"
                  class="text-left px-3 py-2 text-[12px] rounded-[4px] transition-colors capitalize cursor-pointer"
                  [ngClass]="
                    reportType() === t
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  "
                >
                  {{ t }}
                </button>
              }
            </div>
          </div>

          <!-- Generate Statement Button -->
          <div
            class="pt-4 sm:pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60"
          >
            <app-button
              className="w-full py-2.5 flex justify-center text-[12px]"
              [disabled]="loading()"
              (clicked)="handleGenerate()"
            >
              @if (loading()) {
                <app-icon name="loader-2" class="w-4 h-4 animate-spin mr-2" />
                <span>Processing...</span>
              } @else {
                <app-icon name="file-text" class="w-4 h-4 mr-2" />
                <span>Generate Statement</span>
              }
            </app-button>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="flex-1 min-h-[300px] sm:min-h-[400px]">
          <!-- Idle Initial State -->
          @if (!loading() && !generated()) {
            <div
              class="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 py-10"
            >
              <app-icon
                name="file-text"
                class="w-8 sm:w-10 h-8 sm:h-10 mb-4 opacity-20"
              />
              <p class="text-[12px] sm:text-[13px]">
                Configure parameters to generate a statement.
              </p>
            </div>
          }

          <!-- Loading Skeleton -->
          @if (loading()) {
            <div
              class="space-y-8 animate-pulse w-full max-w-4xl py-4"
            >
              <div
                class="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-10"
              ></div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                <div class="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                <div class="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                <div class="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
              <div class="space-y-4 mt-10">
                <div class="h-8 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
                <div class="h-8 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
              </div>
            </div>
          }

          <!-- Statement Generated Content -->
          @if (generated() && !loading()) {
            <div
              class="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 py-4"
            >
              <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8"
              >
                <h2
                  class="text-[13px] sm:text-[14px] font-medium text-zinc-900 dark:text-white"
                >
                  Statement of Activity
                </h2>
                <div class="flex space-x-3 w-full sm:w-auto">
                  <app-button
                    variant="outline"
                    className="flex-1 sm:flex-none py-1.5 px-3 text-[11px]"
                    (clicked)="handleExport('csv')"
                  >
                    CSV Download
                  </app-button>
                  <app-button
                    variant="outline"
                    className="flex-1 sm:flex-none py-1.5 px-3 text-[11px]"
                    (clicked)="handleExport('json')"
                  >
                    JSON
                  </app-button>
                </div>
              </div>

              <!-- Table -->
              <div
                class="border border-zinc-200 dark:border-zinc-800 rounded-[6px] overflow-x-auto"
              >
                <div class="min-w-[300px]">
                  <div
                    class="grid grid-cols-[1fr_auto] gap-4 px-4 sm:px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    <div>Category</div>
                    <div class="text-right">Volume</div>
                  </div>
                  @for (cat of reportCategories(); track cat.name; let isLast = $last) {
                    <div
                      class="grid grid-cols-[1fr_auto] gap-4 px-4 sm:px-5 py-3.5 text-[12px] sm:text-[13px]"
                      [ngClass]="!isLast ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''"
                    >
                      <span class="text-zinc-700 dark:text-zinc-300">{{ cat.name }}</span>
                      <span
                        class="font-medium tabular-nums text-zinc-900 dark:text-zinc-100 text-right"
                      >
                        {{ formatCurrency(cat.volume) }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  readonly store = inject(FinanceStoreService);

  readonly loading = signal<boolean>(false);
  readonly generated = signal<boolean>(false);
  readonly reportRange = signal<string>('1M');
  readonly reportType = signal<string>('all');

  handleGenerate(): void {
    this.loading.set(true);
    this.generated.set(false);
    setTimeout(() => {
      this.loading.set(false);
      this.generated.set(true);
    }, 1200);
  }

  handleExport(format: 'csv' | 'json'): void {
    exportData(this.store.transactions(), format);
  }

  readonly reportCategories = computed(() => {
    const range = this.reportRange();
    const type = this.reportType();
    const txns = this.store.transactions();

    const rangeDays = range === '7D' ? 7 : range === '1M' ? 30 : 90;
    const cutoff = new Date(new Date().getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const filtered = txns.filter(
      (t) => new Date(t.date) >= cutoff && (type === 'all' || t.type === type)
    );

    const categories = Array.from(new Set(filtered.map((t) => t.category)));
    return categories.map((cat) => {
      const vol = filtered
        .filter((t) => t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
      return { name: cat, volume: vol };
    });
  });

  formatCurrency(val: number): string {
    return formatCurrency(val);
  }
}
