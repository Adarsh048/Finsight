import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FinanceStoreService } from './services/finance-store.service';
import { AppIconComponent } from './components/icon/app-icon.component';
import { TransactionDrawerComponent } from './components/overlays/transaction-drawer.component';
import { CommandPaletteComponent } from './components/overlays/command-palette.component';
import { RoleSwitchOverlayComponent } from './components/overlays/role-switch-overlay.component';
import { PageType } from './models/finance.models';

interface NavItem {
  id: PageType;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AppIconComponent,
    TransactionDrawerComponent,
    CommandPaletteComponent,
    RoleSwitchOverlayComponent
  ],
  template: `
    @if (store.isFetching()) {
      <div
        class="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center"
      >
        <app-icon
          name="loader-2"
          class="w-6 h-6 animate-spin text-zinc-900 dark:text-zinc-100 mb-4"
        />
        <p
          class="text-[12px] text-zinc-500 uppercase tracking-widest font-medium"
        >
          Initializing Workspace...
        </p>
      </div>
    } @else {
      <div
        class="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 flex overflow-hidden"
      >
        <!-- Mobile Sidebar Overlay Background -->
        @if (mobileMenuOpen()) {
          <div
            class="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
            (click)="mobileMenuOpen.set(false)"
          ></div>
        }

        <!-- Sidebar Navigation -->
        <aside
          class="fixed md:static inset-y-0 left-0 z-50 h-screen bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col group overflow-hidden transition-all duration-300 ease-in-out shrink-0"
          [ngClass]="
            mobileMenuOpen()
              ? 'w-[240px] translate-x-0 shadow-2xl md:shadow-none'
              : 'w-[240px] -translate-x-full md:w-16 md:translate-x-0 md:hover:w-[240px]'
          "
        >
          <div
            class="h-14 md:h-6 shrink-0 flex items-center px-4 md:hidden border-b border-zinc-100 dark:border-zinc-800/50"
          >
            <span
              class="text-[12px] font-semibold tracking-widest uppercase text-zinc-400"
              >Menu</span
            >
          </div>

          <nav class="flex flex-col space-y-1.5 mt-4 md:mt-2 px-2 flex-1">
            @for (item of navItems; track item.id) {
              <button
                (click)="navigateTo(item.id)"
                class="flex items-center h-10 rounded-[6px] transition-colors whitespace-nowrap overflow-hidden cursor-pointer"
                [ngClass]="
                  store.activePage() === item.id
                    ? 'bg-zinc-200/50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
                "
              >
                <div class="w-12 flex items-center justify-center shrink-0">
                  <app-icon [name]="item.icon" class="w-4 h-4" />
                </div>
                <span
                  class="text-[13px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 font-medium pl-0.5"
                >
                  {{ item.label }}
                </span>
              </button>
            }
          </nav>

          <!-- Profile Section & Role Switcher -->
          <div
            class="py-4 flex items-center border-t border-zinc-200/50 dark:border-zinc-800/50 shrink-0 px-2 mt-auto mb-2"
          >
            <div class="w-12 flex items-center justify-center shrink-0">
              <div
                class="w-10 h-10 rounded-full bg-zinc-200 dark:bg-[#1E1E20] border border-zinc-300 dark:border-zinc-700/50 flex items-center justify-center font-bold text-[13px] text-zinc-900 dark:text-zinc-100 shadow-sm"
              >
                TU
              </div>
            </div>
            <div
              class="flex-1 flex flex-col justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pr-3 pl-1 space-y-1.5"
            >
              <button
                (click)="toggleRole()"
                class="w-fit inline-flex items-center text-left text-[9px] px-2.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-[#27272A] transition-all uppercase tracking-[0.1em] font-semibold shadow-sm active:scale-95 cursor-pointer"
                title="Toggle Access Level"
              >
                <app-icon name="shield-check" class="w-3 h-3 mr-1.5 opacity-80" />
                Access: {{ store.role() }}
              </button>
              <span
                class="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate px-0.5 tracking-tight"
                >Test User</span
              >
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main
          class="flex-1 flex flex-col relative overflow-hidden h-screen w-full"
        >
          <!-- Top Bar -->
          <header
            class="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4 sm:px-6 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm shrink-0 z-10"
          >
            <div class="flex items-center md:flex-1">
              <button
                class="md:hidden mr-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 -ml-1 rounded-md active:bg-zinc-100 dark:active:bg-zinc-800 cursor-pointer"
                (click)="mobileMenuOpen.set(true)"
              >
                <app-icon name="menu" class="w-5 h-5" />
              </button>
              <span
                class="hidden md:block text-[13px] font-medium text-zinc-500"
                >Wealth Operations</span
              >
            </div>

            <div
              class="flex-1 flex justify-end md:justify-center w-full max-w-xl mx-2 sm:mx-4"
            >
              <!-- Desktop Search Bar -->
              <button
                (click)="store.toggleCmd()"
                class="hidden md:flex items-center justify-center text-[12px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1.5 rounded-[4px] w-full border border-zinc-200/50 dark:border-zinc-800 cursor-pointer"
              >
                <app-icon name="search" class="w-3.5 h-3.5 mr-2.5" />
                <span>Search commands...</span>
              </button>
            </div>

            <div
              class="flex items-center justify-end space-x-3 sm:space-x-5 md:flex-1"
            >
              <!-- Mobile Search Icon -->
              <button
                (click)="store.toggleCmd()"
                class="md:hidden text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1.5 cursor-pointer"
              >
                <app-icon name="search" class="w-4 h-4" />
              </button>

              <!-- Theme Toggle -->
              <button
                (click)="store.toggleDark()"
                class="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1.5 cursor-pointer"
              >
                <app-icon
                  [name]="store.darkMode() ? 'sun' : 'moon'"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </header>

          <!-- Routed Page Content -->
          <div class="flex-1 overflow-y-auto w-full">
            <div
              class="w-full px-4 sm:px-10 lg:px-16 py-6 sm:py-10 h-full max-w-7xl mx-auto"
            >
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>

        <!-- Overlays -->
        <app-transaction-drawer />
        <app-command-palette />
        <app-role-switch-overlay />
      </div>
    }
  `
})
export class AppComponent {
  readonly store = inject(FinanceStoreService);
  private router = inject(Router);

  readonly mobileMenuOpen = signal<boolean>(false);

  readonly navItems: NavItem[] = [
    { id: 'dashboard', icon: 'pie-chart', label: 'Overview' },
    { id: 'transactions', icon: 'list', label: 'Ledger' },
    { id: 'analytics', icon: 'bar-chart-2', label: 'Intelligence' },
    { id: 'reports', icon: 'file-text', label: 'Statements' },
    { id: 'integrations', icon: 'plug', label: 'Integrations' }
  ];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects.replace('/', '') as PageType;
        if (
          url === 'dashboard' ||
          url === 'transactions' ||
          url === 'analytics' ||
          url === 'reports' ||
          url === 'integrations'
        ) {
          this.store.activePage.set(url);
        }
      });
  }

  navigateTo(page: PageType): void {
    this.store.navigate(page);
    this.mobileMenuOpen.set(false);
  }

  toggleRole(): void {
    const nextRole = this.store.role() === 'admin' ? 'viewer' : 'admin';
    this.store.startRoleSwitch(nextRole);
  }
}
