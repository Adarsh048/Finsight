import {
  Component,
  effect,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppIconComponent } from '../icon/app-icon.component';
import { AppButtonComponent } from '../button/app-button.component';
import { Transaction, TransactionType } from '../../models/finance.models';
import { formatCurrency, formatDate } from '../../utils/formatters';

@Component({
  selector: 'app-transaction-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent, AppButtonComponent],
  template: `
    @if (store.selectedTxn()) {
      <div
        class="fixed inset-0 bg-zinc-900/20 dark:bg-[#0A0A0A]/60 z-40 transition-opacity backdrop-blur-[2px]"
        (click)="closeDrawer()"
      ></div>

      <div
        class="fixed inset-y-0 right-0 w-full sm:max-w-[360px] bg-white dark:bg-[#111] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50"
        >
          <h2
            class="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider"
          >
            {{ isEditing() ? 'Edit Ledger Entry' : 'Ledger Entry' }}
          </h2>
          <button
            (click)="closeDrawer()"
            class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <app-icon name="x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Body: Edit mode vs View mode -->
        @if (isEditing()) {
          <div class="px-6 py-6 flex-1 overflow-y-auto space-y-5">
            <div>
              <label
                class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block"
                >Merchant</label
              >
              <input
                type="text"
                [ngModel]="formData()?.merchant"
                (ngModelChange)="updateField('merchant', $event)"
                class="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-900 dark:text-zinc-100 pb-1.5 outline-none focus:border-zinc-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label
                  class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block"
                  >Amount</label
                >
                <input
                  type="number"
                  [ngModel]="formData()?.amount"
                  (ngModelChange)="updateField('amount', +$event)"
                  class="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-900 dark:text-zinc-100 pb-1.5 outline-none focus:border-zinc-500 tabular-nums"
                />
              </div>
              <div>
                <label
                  class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block"
                  >Type</label
                >
                <select
                  [ngModel]="formData()?.type"
                  (ngModelChange)="updateField('type', $event)"
                  class="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-900 dark:text-zinc-100 pb-1.5 outline-none focus:border-zinc-500"
                >
                  <option value="expense" class="dark:bg-[#111]">Expense</option>
                  <option value="income" class="dark:bg-[#111]">Income</option>
                </select>
              </div>
            </div>
            <div>
              <label
                class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block"
                >Category</label
              >
              <select
                [ngModel]="formData()?.category"
                (ngModelChange)="updateField('category', $event)"
                class="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-900 dark:text-zinc-100 pb-1.5 outline-none focus:border-zinc-500"
              >
                <option value="Income" class="dark:bg-[#111]">Income</option>
                <option value="Housing" class="dark:bg-[#111]">Housing</option>
                <option value="Investments" class="dark:bg-[#111]">Investments</option>
                <option value="Groceries" class="dark:bg-[#111]">Groceries</option>
                <option value="Food & Dining" class="dark:bg-[#111]">Food & Dining</option>
                <option value="Transport" class="dark:bg-[#111]">Transport</option>
                <option value="Shopping" class="dark:bg-[#111]">Shopping</option>
                <option value="Health" class="dark:bg-[#111]">Health</option>
              </select>
            </div>
          </div>
        } @else {
          <div class="px-6 py-8 flex-1 overflow-y-auto">
            <div
              class="mb-8 flex flex-col items-start border-b border-zinc-100 dark:border-zinc-800/50 pb-6"
            >
              <h1
                class="text-3xl font-semibold tracking-tight tabular-nums mb-1 text-zinc-900 dark:text-zinc-100"
              >
                {{ store.selectedTxn()!.type === 'income' ? '+' : '-' }}{{ formatCurrency(store.selectedTxn()!.amount) }}
              </h1>
              <p class="text-[13px] text-zinc-900 dark:text-zinc-100 font-medium">
                {{ store.selectedTxn()!.merchant }}
              </p>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-baseline">
                <span class="text-[12px] text-zinc-500">Date</span>
                <span
                  class="text-[12px] text-zinc-900 dark:text-zinc-100 font-medium tabular-nums"
                  >{{ formatDate(store.selectedTxn()!.date) }}</span
                >
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-[12px] text-zinc-500">Status</span>
                <span class="text-[12px] font-medium capitalize">{{
                  store.selectedTxn()!.status
                }}</span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-[12px] text-zinc-500">Category</span>
                <span
                  class="text-[12px] text-zinc-900 dark:text-zinc-100 font-medium"
                  >{{ store.selectedTxn()!.category }}</span
                >
              </div>
            </div>
          </div>
        }

        <!-- Footer Actions -->
        @if (store.role() === 'admin') {
          <div
            class="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#111] flex space-x-3 pb-safe"
          >
            @if (isEditing()) {
              <app-button
                variant="outline"
                className="flex-1"
                (clicked)="isEditing.set(false)"
                >Cancel</app-button
              >
              <app-button
                variant="primary"
                className="flex-1"
                (clicked)="saveChanges()"
                >Save Changes</app-button
              >
            } @else {
              <app-button
                variant="outline"
                className="flex-1 text-red-600 dark:text-red-400"
                (clicked)="deleteCurrentTxn()"
                >Delete</app-button
              >
              <app-button
                variant="secondary"
                className="flex-1"
                (clicked)="isEditing.set(true)"
              >
                <app-icon name="pencil" class="w-3.5 h-3.5 mr-2" />
                Edit
              </app-button>
            }
          </div>
        } @else {
          <div
            class="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#111] flex items-center justify-center pb-safe"
          >
            <span
              class="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center font-medium"
            >
              <app-icon name="shield-check" class="w-3 h-3 mr-1.5 opacity-70" />
              Viewer Access (Read-Only)
            </span>
          </div>
        }
      </div>
    }
  `
})
export class TransactionDrawerComponent {
  readonly store = inject(FinanceStoreService);

  readonly isEditing = signal<boolean>(false);
  readonly formData = signal<Transaction | null>(null);

  constructor() {
    effect(() => {
      const txn = this.store.selectedTxn();
      this.isEditing.set(false);
      if (txn) {
        this.formData.set({ ...txn });
      } else {
        this.formData.set(null);
      }
    });
  }

  closeDrawer(): void {
    this.store.selectTxn(null);
  }

  updateField(field: keyof Transaction, val: any): void {
    const cur = this.formData();
    if (cur) {
      this.formData.set({ ...cur, [field]: val });
    }
  }

  saveChanges(): void {
    const data = this.formData();
    if (data) {
      this.store.updateTxn(data);
    }
  }

  deleteCurrentTxn(): void {
    const txn = this.store.selectedTxn();
    if (txn) {
      this.store.deleteTxn(txn.id);
    }
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount);
  }

  formatDate(date: string): string {
    return formatDate(date);
  }
}
