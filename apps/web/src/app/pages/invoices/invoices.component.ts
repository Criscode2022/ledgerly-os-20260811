import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Client, Invoice, InvoiceItem } from '../../core/models';
import { money, shortDate } from '../../core/format';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent implements OnInit {
  private api = inject(ApiService);
  invoices = signal<Invoice[]>([]);
  clients = signal<Client[]>([]);
  statusFilter = '';
  showForm = signal(false);
  money = money;
  shortDate = shortDate;
  error = signal('');

  form = {
    clientId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    taxRate: 8.5,
    notes: '',
    status: 'draft',
    items: [{ description: '', quantity: 1, unitPrice: 0 }] as InvoiceItem[],
  };

  ngOnInit() {
    this.reload();
    this.api.listClients().subscribe((c) => this.clients.set(c));
  }

  reload() {
    this.api.listInvoices(this.statusFilter || undefined).subscribe({
      next: (list) => this.invoices.set(list),
      error: () => this.error.set('Failed to load invoices'),
    });
  }

  openCreate() {
    this.form = {
      clientId: this.clients()[0]?.id || '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      taxRate: 8.5,
      notes: '',
      status: 'draft',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    };
    this.showForm.set(true);
  }

  addItem() {
    this.form.items.push({ description: '', quantity: 1, unitPrice: 0 });
  }

  removeItem(i: number) {
    if (this.form.items.length === 1) return;
    this.form.items.splice(i, 1);
  }

  lineTotal(item: InvoiceItem) {
    return (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }

  previewSubtotal() {
    return this.form.items.reduce((s, i) => s + this.lineTotal(i), 0);
  }

  previewTax() {
    return Math.round(this.previewSubtotal() * (this.form.taxRate / 100) * 100) / 100;
  }

  previewTotal() {
    return Math.round((this.previewSubtotal() + this.previewTax()) * 100) / 100;
  }

  save() {
    if (!this.form.clientId) {
      this.error.set('Select a client');
      return;
    }
    this.api
      .createInvoice({
        clientId: this.form.clientId,
        issueDate: this.form.issueDate,
        dueDate: this.form.dueDate,
        taxRate: Number(this.form.taxRate),
        notes: this.form.notes || undefined,
        status: this.form.status,
        items: this.form.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      })
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.reload();
        },
        error: (e) => this.error.set(e?.error?.message || 'Could not create invoice'),
      });
  }

  setStatus(inv: Invoice, status: string) {
    this.api.updateInvoice(inv.id, { status }).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Update failed'),
    });
  }

  remove(inv: Invoice) {
    if (!confirm(`Delete ${inv.number}?`)) return;
    this.api.deleteInvoice(inv.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
