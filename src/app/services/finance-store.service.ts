import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Transaction,
  UserRole,
  PageType,
  CategorySummary,
  DailyBalance
} from '../models/finance.models';
import {
  loadTransactions,
  safeStorageGet,
  safeStorageSet
} from '../utils/mock-data';

@Injectable({
  providedIn: 'root'
})
export class FinanceStoreService {
  private router = inject(Router);

  // State Signals
  readonly isFetching = signal<boolean>(true);
  readonly transactions = signal<Transaction[]>([]);
  readonly role = signal<UserRole>('admin');
  readonly darkMode = signal<boolean>(safeStorageGet('fin_dark') !== 'false');
  readonly selectedTxn = signal<Transaction | null>(null);
  readonly cmdOpen = signal<boolean>(false);
  readonly activePage = signal<PageType>('dashboard');
  readonly switchingToRole = signal<UserRole | null>(null);

  // Computed State
  readonly totalBalance = computed(() => {
    return this.transactions().reduce(
      (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
      0
    );
  });

  readonly currentMonthTxns = computed(() => {
    const now = new Date();
    return this.transactions().filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  });

  readonly currentStats = computed(() => {
    return this.currentMonthTxns().reduce(
      (acc, t) => {
        if (t.type === 'income') acc.in += t.amount;
        else acc.out += t.amount;
        return acc;
      },
      { in: 0, out: 0 }
    );
  });

  readonly netFlow14D = computed<DailyBalance[]>(() => {
    const txns = this.transactions();
    const cutoff = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000);
    const recent = txns.filter((t) => new Date(t.date) >= cutoff);
    const daily = recent.reduce<Record<string, { in: number; out: number }>>((acc, t) => {
      if (!acc[t.date]) acc[t.date] = { in: 0, out: 0 };
      if (t.type === 'income') acc[t.date].in += t.amount;
      else acc[t.date].out += t.amount;
      return acc;
    }, {});

    return Object.entries(daily)
      .map(([date, vals]) => ({ date, balance: vals.in - vals.out }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly spendAllocation = computed<CategorySummary[]>(() => {
    const grouped = this.currentMonthTxns()
      .filter((t) => t.type === 'expense')
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  constructor() {
    this.applyTheme(this.darkMode());
    this.initializeData();
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private initializeData(): void {
    setTimeout(() => {
      const txns = loadTransactions();
      this.transactions.set(txns);
      this.isFetching.set(false);
    }, 800);
  }

  toggleDark(): void {
    const newDark = !this.darkMode();
    safeStorageSet('fin_dark', String(newDark));
    this.applyTheme(newDark);
    this.darkMode.set(newDark);
  }

  toggleCmd(open?: boolean): void {
    if (open !== undefined) {
      this.cmdOpen.set(open);
    } else {
      this.cmdOpen.set(!this.cmdOpen());
    }
  }

  selectTxn(txn: Transaction | null): void {
    this.selectedTxn.set(txn);
  }

  navigate(page: PageType): void {
    this.activePage.set(page);
    this.router.navigate([page]);
  }

  startRoleSwitch(targetRole: UserRole): void {
    this.switchingToRole.set(targetRole);
    setTimeout(() => {
      this.role.set(targetRole);
      this.switchingToRole.set(null);
    }, 800);
  }

  updateTxn(updatedTxn: Transaction): void {
    const updated = this.transactions().map((t) =>
      t.id === updatedTxn.id ? updatedTxn : t
    );
    safeStorageSet('fin_transactions_salaried_v1', JSON.stringify(updated));
    this.transactions.set(updated);
    this.selectedTxn.set(null);
  }

  deleteTxn(id: string): void {
    const filtered = this.transactions().filter((t) => t.id !== id);
    safeStorageSet('fin_transactions_salaried_v1', JSON.stringify(filtered));
    this.transactions.set(filtered);
    this.selectedTxn.set(null);
  }
}
