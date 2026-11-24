import {
  Component,
  computed,
  signal,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppIconComponent } from '../../components/icon/app-icon.component';
import { Transaction, SortOption } from '../../models/finance.models';
import { formatCurrency, formatDate } from '../../utils/formatters';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-in fade-in duration-500 flex flex-col h-full">
      <!-- Top Sticky Filter Bar -->
      <div
        class="pb-4 sm:pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60 sticky top-0 bg-white/95 dark:bg-[#0A0A0A]/95 z-10 pt-2"
      >
        <h1
          class="text-xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4 sm:mb-6"
        >
          Ledger
        </h1>

        <div class="flex flex-col space-y-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <!-- Search Input -->
            <div class="relative w-full sm:w-72">
              <app-icon
                name="search"
                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search merchant..."
                [ngModel]="query()"
                (ngModelChange)="query.set($event)"
                class="w-full pl-9 pr-3 py-2 text-[12px] bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-[4px] outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <div
              class="flex items-center justify-between sm:justify-start space-x-2 w-full sm:w-auto"
            >
              <!-- Type Filters -->
              <div
                class="flex items-center bg-zinc-50 dark:bg-zinc-800/40 p-0.5 rounded-[4px] border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-x-auto no-scrollbar"
              >
                @for (t of ['all', 'income', 'expense']; track t) {
                  <button
                    (click)="setTypeFilter(t)"
                    class="px-3 py-1.5 text-[11px] font-medium capitalize rounded-[3px] transition-colors cursor-pointer"
                    [ngClass]="
                      typeFilter() === t
                        ? 'bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                    "
                  >
                    {{ t }}
                  </button>
                }
              </div>

              <!-- Sort Dropdown -->
              <div class="relative shrink-0 z-30">
                <button
                  (click)="isSortOpen.set(!isSortOpen())"
                  class="flex items-center justify-between w-[110px] sm:w-[120px] bg-zinc-50 dark:bg-zinc-800/40 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-[4px] px-2.5 py-1.5 outline-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <span class="truncate">{{ activeSortLabel() }}</span>
                  <app-icon
                    name="chevron-down"
                    class="w-3 h-3 ml-2 opacity-70 shrink-0"
                  />
                </button>

                @if (isSortOpen()) {
                  <div
                    class="fixed inset-0 z-20"
                    (click)="isSortOpen.set(false)"
                  ></div>
                  <div
                    class="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-[4px] shadow-xl z-30 overflow-hidden py-1"
                  >
                    @for (option of sortOptions; track option.value) {
                      <button
                        (click)="selectSort(option.value)"
                        class="w-full text-left px-3 py-2 text-[11px] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                      >
                        {{ option.label }}
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Category Pills -->
          <div
            class="w-full overflow-x-auto no-scrollbar flex items-center space-x-1.5 sm:border-l sm:border-zinc-200 sm:dark:border-zinc-800 sm:pl-5 pb-1"
          >
            <app-icon
              name="filter"
              class="w-3.5 h-3.5 text-zinc-400 mr-1 sm:mr-2 shrink-0 hidden sm:block"
            />
            @for (cat of categories(); track cat) {
              <button
                (click)="catFilter.set(cat)"
                class="px-2.5 py-1.5 text-[11px] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
                [ngClass]="
                  catFilter() === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900 font-medium'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                "
              >
                {{ cat }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="flex-1 mt-2 sm:mt-4 w-full">
        <div class="flex flex-col">
          @if (filteredTxns().length === 0) {
            <div class="py-16 text-center text-[12px] text-zinc-500">
              No records match the current filters.
            </div>
          } @else {
            @for (txn of filteredTxns(); track txn.id) {
              <div
                (click)="store.selectTxn(txn)"
                class="flex justify-between items-center py-3.5 border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-[4px]"
              >
                <div class="flex flex-col overflow-hidden pr-3">
                  <span
                    class="text-[12px] sm:text-[13px] font-medium text-zinc-900 dark:text-zinc-100 tracking-tight truncate"
                    >{{ txn.merchant }}</span
                  >
                  <span
                    class="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 sm:mt-1 truncate"
                    >{{ txn.category }} • {{ formatDate(txn.date, 'short') }}</span
                  >
                </div>
                <div class="flex flex-col items-end text-right shrink-0">
                  <span
                    class="text-[12px] sm:text-[13px] font-medium tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100"
                  >
                    {{ txn.type === 'income' ? '+' : '-' }}{{ formatCurrency(txn.amount) }}
                  </span>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent {
  readonly store = inject(FinanceStoreService);

  readonly query = signal<string>('');
  readonly typeFilter = signal<string>('all');
  readonly catFilter = signal<string>('All');
  readonly sortBy = signal<SortOption>('date-desc');
  readonly isSortOpen = signal<boolean>(false);

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-desc', label: 'Highest Amount' },
    { value: 'amount-asc', label: 'Lowest Amount' }
  ];

  readonly activeSortLabel = computed(() => {
    return this.sortOptions.find((o) => o.value === this.sortBy())?.label;
  });

  readonly categories = computed(() => {
    const txns = this.store.transactions();
    const type = this.typeFilter();
    const relevant = type === 'all' ? txns : txns.filter((t) => t.type === type);
    const set = new Set(relevant.map((t) => t.category));
    return ['All', ...Array.from(set).sort()];
  });

  constructor() {
    effect(() => {
      const cats = this.categories();
      const current = this.catFilter();
      if (current !== 'All' && !cats.includes(current)) {
        this.catFilter.set('All');
      }
    });
  }

  setTypeFilter(t: string): void {
    this.typeFilter.set(t);
  }

  selectSort(val: SortOption): void {
    this.sortBy.set(val);
    this.isSortOpen.set(false);
  }

  readonly filteredTxns = computed(() => {
    const txns = this.store.transactions();
    const type = this.typeFilter();
    const cat = this.catFilter();
    const q = this.query().toLowerCase();
    const sort = this.sortBy();

    const result = txns.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (cat !== 'All' && t.category !== cat) return false;
      if (
        q &&
        !t.merchant.toLowerCase().includes(q) &&
        !t.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'date-desc')
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'date-asc')
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  });

  formatCurrency(val: number): string {
    return formatCurrency(val);
  }

  formatDate(d: string, format: 'short' | 'medium' = 'medium'): string {
    return formatDate(d, format);
  }
}
