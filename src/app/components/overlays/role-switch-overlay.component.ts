import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppIconComponent } from '../icon/app-icon.component';

@Component({
  selector: 'app-role-switch-overlay',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    @if (store.switchingToRole()) {
      <div
        class="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm animate-in fade-in duration-200 px-4 text-center"
      >
        <div class="flex flex-col items-center">
          <app-icon
            name="loader-2"
            class="w-6 h-6 animate-spin text-zinc-900 dark:text-zinc-100 mb-4"
          />
          <h2
            class="text-[14px] font-medium text-zinc-900 dark:text-zinc-100 tracking-tight"
          >
            Switching to
            {{ store.switchingToRole() === 'admin' ? 'Admin' : 'Viewer' }}
            Workspace...
          </h2>
        </div>
      </div>
    }
  `
})
export class RoleSwitchOverlayComponent {
  readonly store = inject(FinanceStoreService);
}
