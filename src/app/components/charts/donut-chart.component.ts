import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { CategorySummary } from '../../models/finance.models';
import { formatCurrency } from '../../utils/formatters';

interface Slice {
  name: string;
  value: number;
  path: string;
  color: string;
  percentage: number;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #chartContainer
      class="relative w-full h-full flex items-center justify-center select-none"
      (mouseleave)="onMouseLeave()"
    >
      <svg class="w-full h-full max-h-[180px]" viewBox="0 0 200 200">
        <g transform="translate(100, 100)">
          @for (slice of slices(); track slice.name; let i = $index) {
            <path
              [attr.d]="slice.path"
              [attr.fill]="slice.color"
              class="transition-opacity duration-200 cursor-pointer"
              [style.opacity]="hoveredSlice() && hoveredSlice()?.name !== slice.name ? '0.6' : '1'"
              (mouseenter)="onSliceHover(slice, $event)"
            />
          }
        </g>
      </svg>

      <!-- Recharts-style Tooltip -->
      @if (hoveredSlice()) {
        <div
          class="absolute pointer-events-none z-20 rounded-[6px] px-2.5 py-1.5 text-[12px] shadow-md border transition-all duration-75"
          [ngClass]="store.darkMode() ? 'bg-[#111] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          <div class="font-medium flex items-center gap-2">
            <span class="text-zinc-400 font-normal">{{ hoveredSlice()!.name }}:</span>
            <span class="tabular-nums font-semibold">{{ formatValue(hoveredSlice()!.value) }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class DonutChartComponent {
  readonly store = inject(FinanceStoreService);

  @Input() data: CategorySummary[] = [];
  @Input() innerRadius = 55;
  @Input() outerRadius = 75;

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  readonly hoveredSlice = signal<Slice | null>(null);
  readonly tooltipX = signal<number>(0);
  readonly tooltipY = signal<number>(0);

  readonly colors = computed(() => {
    return this.store.darkMode()
      ? ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46']
      : ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'];
  });

  readonly slices = computed<Slice[]>(() => {
    if (!this.data || this.data.length === 0) return [];
    const total = this.data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) return [];

    const padAngle = 0.03; // gap between slices
    let currentAngle = -Math.PI / 2; // start at top

    return this.data.map((item, index) => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const startAngle = currentAngle + padAngle / 2;
      const endAngle = currentAngle + sliceAngle - padAngle / 2;
      currentAngle += sliceAngle;

      const path = this.describeArc(
        0,
        0,
        this.innerRadius,
        this.outerRadius,
        startAngle,
        endAngle
      );

      const colorList = this.colors();
      const color = colorList[index % colorList.length];

      return {
        name: item.name,
        value: item.value,
        path,
        color,
        percentage: Math.round((item.value / total) * 100)
      };
    });
  });

  private describeArc(
    cx: number,
    cy: number,
    rIn: number,
    rOut: number,
    startAngle: number,
    endAngle: number
  ): string {
    const angleDiff = endAngle - startAngle;
    if (angleDiff <= 0) return '';

    const x1Out = cx + rOut * Math.cos(startAngle);
    const y1Out = cy + rOut * Math.sin(startAngle);
    const x2Out = cx + rOut * Math.cos(endAngle);
    const y2Out = cy + rOut * Math.sin(endAngle);

    const x1In = cx + rIn * Math.cos(endAngle);
    const y1In = cy + rIn * Math.sin(endAngle);
    const x2In = cx + rIn * Math.cos(startAngle);
    const y2In = cy + rIn * Math.sin(startAngle);

    const largeArc = angleDiff > Math.PI ? 1 : 0;

    return `
      M ${x1Out} ${y1Out}
      A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out}
      L ${x1In} ${y1In}
      A ${rIn} ${rIn} 0 ${largeArc} 0 ${x2In} ${y2In}
      Z
    `.trim();
  }

  onSliceHover(slice: Slice, event: MouseEvent): void {
    this.hoveredSlice.set(slice);
    if (!this.chartContainer) return;
    const rect = this.chartContainer.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.tooltipX.set(Math.min(rect.width - 120, Math.max(10, mouseX - 60)));
    this.tooltipY.set(Math.max(10, mouseY - 40));
  }

  onMouseLeave(): void {
    this.hoveredSlice.set(null);
  }

  formatValue(val: number): string {
    return formatCurrency(val);
  }
}
