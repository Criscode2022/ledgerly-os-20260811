import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DashboardSummary } from '../../core/models';
import { money, shortDate } from '../../core/format';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  auth = inject(AuthService);

  data = signal<DashboardSummary | null>(null);
  error = signal('');
  money = money;
  shortDate = shortDate;

  @ViewChild('revChart') revChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef?: ElementRef<HTMLCanvasElement>;
  private charts: Chart[] = [];

  ngAfterViewInit() {
    this.api.dashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        queueMicrotask(() => this.renderCharts(d));
      },
      error: () => this.error.set('Could not load dashboard'),
    });
  }

  ngOnDestroy() {
    this.charts.forEach((c) => c.destroy());
  }

  private renderCharts(d: DashboardSummary) {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    if (this.revChartRef) {
      const cfg: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: d.monthly.map((m) => m.label),
          datasets: [
            {
              label: 'Revenue',
              data: d.monthly.map((m) => m.revenue),
              backgroundColor: 'rgba(45, 212, 191, 0.75)',
              borderRadius: 6,
            },
            {
              label: 'Expenses',
              data: d.monthly.map((m) => m.expenses),
              backgroundColor: 'rgba(248, 113, 113, 0.55)',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8b9bb0', boxWidth: 12 },
            },
          },
          scales: {
            x: {
              ticks: { color: '#8b9bb0' },
              grid: { color: 'rgba(36,48,65,0.6)' },
            },
            y: {
              ticks: { color: '#8b9bb0' },
              grid: { color: 'rgba(36,48,65,0.6)' },
            },
          },
        },
      };
      this.charts.push(new Chart(this.revChartRef.nativeElement, cfg));
    }
    if (this.statusChartRef) {
      const labels = Object.keys(d.byStatus);
      const values = labels.map((k) => d.byStatus[k]);
      const colors: Record<string, string> = {
        draft: '#8b9bb0',
        sent: '#38bdf8',
        paid: '#34d399',
        overdue: '#f87171',
        void: '#fbbf24',
      };
      const cfg: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: labels.map((l) => colors[l] || '#8b9bb0'),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#8b9bb0', boxWidth: 10 },
            },
          },
        },
      };
      this.charts.push(new Chart(this.statusChartRef.nativeElement, cfg));
    }
  }
}
