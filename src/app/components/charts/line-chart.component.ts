import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
  computed,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceStoreService } from '../../services/finance-store.service';
import { formatCurrency, formatCompactNumber, formatDate } from '../../utils/formatters';

interface Point {
  x: number;
  y: number;
  date: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #chartContainer
      class="relative w-full h-full select-none"
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
    >
      <svg class="w-full h-full overflow-visible" [attr.viewBox]="viewBox()">
        <!-- Grid lines -->
        <g class="grid-lines">
          @for (grid of gridLines(); track grid.y) {
            <line
              [attr.x1]="margin.left"
              [attr.y1]="grid.y"
              [attr.x2]="width - margin.right"
              [attr.y2]="grid.y"
              [attr.stroke]="gridStroke()"
              stroke-dasharray="3 3"
              stroke-width="1"
            />
            <text
              [attr.x]="margin.left - 10"
              [attr.y]="grid.y + 3"
              text-anchor="end"
              font-size="10"
              fill="#a1a1aa"
              class="tabular-nums"
            >
              {{ grid.label }}
            </text>
          }
        </g>

        <!-- X-axis ticks -->
        <g class="x-axis-ticks">
          @for (tick of xTicks(); track tick.date) {
            <text
              [attr.x]="tick.x"
              [attr.y]="height - margin.bottom + 16"
              text-anchor="middle"
              font-size="10"
              fill="#a1a1aa"
            >
              {{ tick.label }}
            </text>
          }
        </g>

        <!-- Data line -->
        @if (linePath()) {
          <path
            [attr.d]="linePath()"
            fill="none"
            [attr.stroke]="lineStroke()"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        }

        <!-- Hover vertical line & active dot -->
        @if (hoveredPoint()) {
          <line
            [attr.x1]="hoveredPoint()!.x"
            [attr.y1]="margin.top"
            [attr.x2]="hoveredPoint()!.x"
            [attr.y2]="height - margin.bottom"
            stroke="#a1a1aa"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <circle
            [attr.cx]="hoveredPoint()!.x"
            [attr.cy]="hoveredPoint()!.y"
            r="4"
            [attr.fill]="dotFill()"
          />
        }
      </svg>

      <!-- Recharts-style Tooltip -->
      @if (hoveredPoint()) {
        <div
          class="absolute pointer-events-none z-20 rounded-[6px] px-3 py-2 text-[12px] shadow-md border transition-transform duration-75"
          [ngClass]="store.darkMode() ? 'bg-[#111] border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'"
          [style.left.px]="tooltipX()"
          [style.top.px]="tooltipY()"
        >
          <div class="text-[11px] text-[#a1a1aa] mb-1 font-normal">
            {{ formatTooltipDate(hoveredPoint()!.date) }}
          </div>
          <div class="font-medium flex items-center gap-2">
            <span class="text-[11px] text-[#a1a1aa]">{{ unitLabel }}:</span>
            <span class="tabular-nums">{{ formatTooltipCurrency(hoveredPoint()!.value) }}</span>
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
export class LineChartComponent {
  readonly store = inject(FinanceStoreService);

  @Input() data: any[] = [];
  @Input() dataKey = 'balance';
  @Input() unitLabel = 'Net';

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  readonly width = 600;
  readonly height = 220;
  readonly margin = { top: 12, right: 15, bottom: 25, left: 60 };

  readonly viewBox = computed(() => `0 0 ${this.width} ${this.height}`);
  readonly gridStroke = computed(() => (this.store.darkMode() ? '#27272a' : '#f4f4f5'));
  readonly lineStroke = computed(() => (this.store.darkMode() ? '#a1a1aa' : '#52525b'));
  readonly dotFill = computed(() => (this.store.darkMode() ? '#ffffff' : '#000000'));

  readonly hoveredPoint = signal<Point | null>(null);
  readonly tooltipX = signal<number>(0);
  readonly tooltipY = signal<number>(0);

  readonly points = computed<Point[]>(() => {
    if (!this.data || this.data.length === 0) return [];
    const values = this.data.map((d) => Number(d[this.dataKey]) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal === minVal ? 1 : maxVal - minVal;

    const plotWidth = this.width - this.margin.left - this.margin.right;
    const plotHeight = this.height - this.margin.top - this.margin.bottom;

    return this.data.map((d, index) => {
      const x =
        this.margin.left +
        (this.data.length === 1 ? plotWidth / 2 : (index / (this.data.length - 1)) * plotWidth);
      const val = Number(d[this.dataKey]) || 0;
      const y = this.height - this.margin.bottom - ((val - minVal) / range) * plotHeight;
      return { x, y, date: d.date, value: val };
    });
  });

  readonly gridLines = computed(() => {
    if (!this.data || this.data.length === 0) return [];
    const values = this.data.map((d) => Number(d[this.dataKey]) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const lines = [];
    const count = 4;
    const plotHeight = this.height - this.margin.top - this.margin.bottom;

    for (let i = 0; i <= count; i++) {
      const val = minVal + ((maxVal - minVal) / count) * (count - i);
      const y = this.margin.top + (i / count) * plotHeight;
      lines.push({ y, label: formatCompactNumber(Math.round(val)) });
    }
    return lines;
  });

  readonly xTicks = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return [];
    // Select about 5-7 evenly spaced ticks
    const step = Math.max(1, Math.floor(pts.length / 5));
    const ticks = [];
    for (let i = 0; i < pts.length; i += step) {
      ticks.push({
        x: pts[i].x,
        date: pts[i].date,
        label: formatDate(pts[i].date, 'short')
      });
    }
    // Ensure the last point is present
    const last = pts[pts.length - 1];
    if (ticks.length > 0 && ticks[ticks.length - 1].date !== last.date) {
      ticks.push({
        x: last.x,
        date: last.date,
        label: formatDate(last.date, 'short')
      });
    }
    return ticks;
  });

  readonly linePath = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    // Generate smooth monotone cubic bezier curve through points
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  });

  onMouseMove(event: MouseEvent): void {
    const pts = this.points();
    if (pts.length === 0 || !this.chartContainer) return;

    const rect = this.chartContainer.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouseX to SVG scale
    const svgX = (mouseX / rect.width) * this.width;

    // Find closest point
    let closest: Point = pts[0];
    let minDiff = Math.abs(pts[0].x - svgX);
    for (let i = 1; i < pts.length; i++) {
      const diff = Math.abs(pts[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pts[i];
      }
    }

    this.hoveredPoint.set(closest);

    // Calculate tooltip pixel position
    const ptPixelX = (closest.x / this.width) * rect.width;
    const ptPixelY = (closest.y / this.height) * rect.height;

    // Keep tooltip inside bounds
    const tooltipWidth = 130;
    const xPos = ptPixelX + 10 + tooltipWidth > rect.width ? ptPixelX - tooltipWidth - 10 : ptPixelX + 10;
    const yPos = Math.max(10, ptPixelY - 45);

    this.tooltipX.set(xPos);
    this.tooltipY.set(yPos);
  }

  onMouseLeave(): void {
    this.hoveredPoint.set(null);
  }

  formatTooltipDate(d: string): string {
    return formatDate(d);
  }

  formatTooltipCurrency(val: number): string {
    return formatCurrency(val);
  }
}
