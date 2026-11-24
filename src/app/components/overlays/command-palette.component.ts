import {
  Component,
  HostListener,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppIconComponent } from '../icon/app-icon.component';
import { PageType } from '../../models/finance.models';

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  run: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    @if (store.cmdOpen()) {
      <div
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-zinc-900/10 dark:bg-[#0A0A0A]/80 backdrop-blur-[2px] px-4"
        (click)="store.toggleCmd(false)"
      >
        <div
          class="w-full max-w-[420px] bg-white dark:bg-[#111] shadow-2xl border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <div
            class="flex items-center px-3 py-3 border-b border-zinc-100 dark:border-zinc-800"
          >
            <app-icon name="search" class="w-3.5 h-3.5 text-zinc-400 mr-2" />
            <input
              #searchInput
              autofocus
              class="flex-1 bg-transparent border-none outline-none text-[12px] text-zinc-900 dark:text-white placeholder:text-zinc-400"
              placeholder="Search commands..."
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
            />
          </div>

          <div class="max-h-[300px] overflow-y-auto p-1.5">
            @for (action of filteredActions(); track action.id) {
              <button
                (click)="action.run()"
                class="w-full flex items-center px-2 py-2 text-[11px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-[4px] text-left text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                <app-icon
                  [name]="action.icon"
                  class="w-3.5 h-3.5 mr-3 text-zinc-400"
                />
                {{ action.label }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class CommandPaletteComponent {
  readonly store = inject(FinanceStoreService);
  readonly query = signal<string>('');

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.store.toggleCmd();
    }
    if (e.key === 'Escape' && this.store.cmdOpen()) {
      this.store.toggleCmd(false);
    }
  }

  readonly actions = computed<ActionItem[]>(() => [
    {
      id: 'nav-dash',
      label: 'Go to Overview',
      icon: 'pie-chart',
      run: () => {
        this.store.navigate('dashboard');
        this.store.toggleCmd(false);
      }
    },
    {
      id: 'nav-txn',
      label: 'Go to Ledger',
      icon: 'list',
      run: () => {
        this.store.navigate('transactions');
        this.store.toggleCmd(false);
      }
    },
    {
      id: 'nav-ana',
      label: 'Go to Intelligence',
      icon: 'bar-chart-2',
      run: () => {
        this.store.navigate('analytics');
        this.store.toggleCmd(false);
      }
    },
    {
      id: 'nav-rep',
      label: 'Go to Statements',
      icon: 'file-text',
      run: () => {
        this.store.navigate('reports');
        this.store.toggleCmd(false);
      }
    },
    {
      id: 'nav-int',
      label: 'Go to Integrations',
      icon: 'plug',
      run: () => {
        this.store.navigate('integrations');
        this.store.toggleCmd(false);
      }
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      icon: this.store.darkMode() ? 'sun' : 'moon',
      run: () => {
        this.store.toggleDark();
        this.store.toggleCmd(false);
      }
    }
  ]);

  readonly filteredActions = computed(() => {
    const q = this.query().toLowerCase();
    return this.actions().filter((a) => a.label.toLowerCase().includes(q));
  });
}
