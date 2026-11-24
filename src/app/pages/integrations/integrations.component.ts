import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { AppIconComponent } from '../../components/icon/app-icon.component';
import { AppButtonComponent } from '../../components/button/app-button.component';
import { ConnectionNode } from '../../models/finance.models';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, AppIconComponent, AppButtonComponent],
  template: `
    <div class="animate-in fade-in duration-500 h-full flex flex-col relative">
      <!-- Background Tech Grid -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 [mask-image:linear-gradient(to_bottom,white_0%,transparent_80%)]"
      ></div>

      <!-- Header & Global Network Status -->
      <div
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-8"
      >
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <app-icon name="cpu" class="w-4 h-4 text-zinc-400" />
            <span
              class="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400"
              >System Architecture</span
            >
          </div>
          <h1
            class="text-2xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2"
          >
            Connected Nodes
          </h1>
          <p class="text-[13px] text-zinc-500 max-w-xl leading-relaxed">
            Manage encrypted data pipelines and secure OAuth tunnels to external
            financial institutions. Data streams are end-to-end encrypted.
          </p>
        </div>

        <!-- Global Network Status -->
        <div
          class="flex items-center space-x-6 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-[6px] px-5 py-3 shadow-sm"
        >
          <div>
            <p
              class="text-[10px] uppercase tracking-wider text-zinc-500 mb-1"
            >
              Network Status
            </p>
            <div class="flex items-center space-x-2">
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                ></span>
              </span>
              <span
                class="text-[13px] font-medium text-zinc-900 dark:text-zinc-100"
                >Optimal</span
              >
            </div>
          </div>
          <div class="w-px h-8 bg-zinc-200 dark:bg-zinc-800"></div>
          <div>
            <p
              class="text-[10px] uppercase tracking-wider text-zinc-500 mb-1"
            >
              Active Tunnels
            </p>
            <p
              class="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 tabular-nums font-mono"
            >
              {{ activeCount() }} / {{ connections().length }}
            </p>
          </div>
        </div>
      </div>

      <!-- Grid of Nodes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (provider of connections(); track provider.id) {
          <div
            class="relative overflow-hidden rounded-[8px] p-5 flex flex-col transition-all duration-500 group"
            [ngClass]="
              provider.status === 'connected'
                ? 'bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                : 'bg-zinc-50/50 dark:bg-[#111] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
            "
          >
            <!-- Top glowing ambient light for connected state -->
            @if (provider.status === 'connected') {
              <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-emerald-500/20 blur-md pointer-events-none"
              ></div>
            }

            <div class="flex justify-between items-start mb-6">
              <div
                class="w-12 h-12 rounded-[8px] flex items-center justify-center text-[20px] transition-colors"
                [ngClass]="
                  provider.status === 'connected'
                    ? 'bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800/50 border border-transparent'
                "
              >
                {{ provider.icon }}
              </div>

              <div class="flex flex-col items-end">
                @if (provider.status === 'connected') {
                  <span
                    class="inline-flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 px-2 py-1 rounded-[4px]"
                  >
                    <app-icon
                      name="activity"
                      class="w-3 h-3 mr-1 animate-pulse"
                    />
                    Streaming
                  </span>
                } @else {
                  <span
                    class="inline-flex items-center text-[10px] font-medium text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded-[4px]"
                  >
                    Offline
                  </span>
                }
              </div>
            </div>

            <div class="mb-6">
              <h3
                class="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center"
              >
                {{ provider.name }}
              </h3>
              <p class="text-[12px] text-zinc-500 mt-0.5">{{ provider.type }}</p>
            </div>

            <!-- Tech Specs Grid -->
            <div
              class="grid grid-cols-2 gap-3 mb-6 p-3 rounded-[6px] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/50"
            >
              <div>
                <p
                  class="text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 flex items-center"
                >
                  <app-icon name="key" class="w-3 h-3 mr-1" />
                  Protocol
                </p>
                <p
                  class="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate"
                >
                  {{ provider.protocol }}
                </p>
              </div>
              <div>
                <p
                  class="text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1 flex items-center"
                >
                  <app-icon name="network" class="w-3 h-3 mr-1" />
                  Latency
                </p>
                <p
                  class="text-[11px] font-mono text-zinc-700 dark:text-zinc-300"
                >
                  {{ provider.ping }}
                </p>
              </div>
            </div>

            <div class="mt-auto flex items-center justify-between pt-2">
              @if (provider.status === 'connected') {
                <div
                  class="flex items-center text-[10px] font-medium text-zinc-500 uppercase tracking-wide"
                >
                  <app-icon
                    name="refresh-ccw"
                    class="w-3 h-3 mr-1.5 opacity-70"
                  />
                  Sync: {{ provider.lastSync }}
                </div>
                <button
                  (click)="handleDisconnect(provider.id)"
                  class="text-[11px] font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-[4px] cursor-pointer"
                >
                  Terminate
                </button>
              } @else {
                <app-button
                  variant="outline"
                  className="w-full py-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-solid hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group/btn"
                  (clicked)="handleConnect(provider.id)"
                  [disabled]="connectingId() === provider.id"
                >
                  @if (connectingId() === provider.id) {
                    <app-icon
                      name="loader-2"
                      class="w-3.5 h-3.5 mr-2 animate-spin text-zinc-900 dark:text-white"
                    />
                    <span class="text-zinc-900 dark:text-white"
                      >Handshaking...</span
                    >
                  } @else {
                    <app-icon
                      name="link"
                      class="w-3.5 h-3.5 mr-2 text-zinc-400 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-white transition-colors"
                    />
                    <span
                      class="text-zinc-600 group-hover/btn:text-zinc-900 dark:text-zinc-400 dark:group-hover/btn:text-white transition-colors"
                      >Initialize Connection</span
                    >
                  }
                </app-button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class IntegrationsComponent {
  readonly store = inject(FinanceStoreService);

  readonly connections = signal<ConnectionNode[]>([
    {
      id: 'zerodha',
      name: 'Zerodha Kite',
      type: 'Brokerage',
      protocol: 'FIX API v2.1',
      ping: '12ms',
      status: 'connected',
      lastSync: '10 mins ago',
      icon: '📈'
    },
    {
      id: 'hdfc',
      name: 'HDFC NetBanking',
      type: 'Bank Account',
      protocol: 'OAuth 2.0',
      ping: '45ms',
      status: 'connected',
      lastSync: '1 hour ago',
      icon: '🏦'
    },
    {
      id: 'sbi',
      name: 'SBI Corporate',
      type: 'Bank Account',
      protocol: 'OAuth 2.0',
      ping: '--',
      status: 'disconnected',
      icon: '🏛️'
    },
    {
      id: 'cred',
      name: 'CRED Partner',
      type: 'Credit Cards',
      protocol: 'REST API',
      ping: '--',
      status: 'disconnected',
      icon: '💳'
    },
    {
      id: 'epfo',
      name: 'EPFO India',
      type: 'Government',
      protocol: 'SOAP Webhook',
      ping: '--',
      status: 'disconnected',
      icon: '🛡️'
    },
    {
      id: 'binance',
      name: 'Binance Global',
      type: 'Crypto Wallet',
      protocol: 'WSS Stream',
      ping: '--',
      status: 'disconnected',
      icon: '🪙'
    }
  ]);

  readonly connectingId = signal<string | null>(null);

  readonly activeCount = computed(() => {
    return this.connections().filter((c) => c.status === 'connected').length;
  });

  handleConnect(id: string): void {
    this.connectingId.set(id);
    setTimeout(() => {
      this.connections.update((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'connected',
                lastSync: 'Live',
                ping: `${Math.floor(Math.random() * 30 + 10)}ms`
              }
            : c
        )
      );
      this.connectingId.set(null);
    }, 2000);
  }

  handleDisconnect(id: string): void {
    this.connections.update((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'disconnected', lastSync: null, ping: '--' } : c
      )
    );
  }
}
