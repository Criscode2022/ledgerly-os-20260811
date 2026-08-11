import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Invoice } from '../../core/models';
import { money, shortDate } from '../../core/format';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  invoice = signal<Invoice | null>(null);
  error = signal('');
  money = money;
  shortDate = shortDate;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getInvoice(id).subscribe({
      next: (inv) => this.invoice.set(inv),
      error: () => this.error.set('Invoice not found'),
    });
  }
}
