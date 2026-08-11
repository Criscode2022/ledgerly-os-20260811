import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Client } from '../../core/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  private api = inject(ApiService);
  clients = signal<Client[]>([]);
  q = '';
  showForm = signal(false);
  editing = signal<Client | null>(null);
  form = { name: '', email: '', company: '', phone: '', address: '', notes: '' };
  error = signal('');

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.listClients(this.q || undefined).subscribe({
      next: (list) => this.clients.set(list),
      error: () => this.error.set('Failed to load clients'),
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form = { name: '', email: '', company: '', phone: '', address: '', notes: '' };
    this.showForm.set(true);
  }

  openEdit(c: Client) {
    this.editing.set(c);
    this.form = {
      name: c.name,
      email: c.email || '',
      company: c.company || '',
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || '',
    };
    this.showForm.set(true);
  }

  save() {
    const body = { ...this.form };
    const ed = this.editing();
    const req = ed
      ? this.api.updateClient(ed.id, body)
      : this.api.createClient(body);
    req.subscribe({
      next: () => {
        this.showForm.set(false);
        this.reload();
      },
      error: (e) => this.error.set(e?.error?.message || 'Save failed'),
    });
  }

  remove(c: Client) {
    if (!confirm(`Delete ${c.name}?`)) return;
    this.api.deleteClient(c.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
