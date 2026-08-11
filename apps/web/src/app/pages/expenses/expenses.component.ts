import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Expense } from '../../core/models';
import { money, shortDate } from '../../core/format';

const CATEGORIES = [
  'Software',
  'Infrastructure',
  'Marketing',
  'Office',
  'Travel',
  'Education',
  'Equipment',
  'Other',
];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expenses.component.html',
})
export class ExpensesComponent implements OnInit {
  private api = inject(ApiService);
  expenses = signal<Expense[]>([]);
  categories = CATEGORIES;
  showForm = signal(false);
  money = money;
  shortDate = shortDate;
  error = signal('');
  form = {
    description: '',
    category: 'Software',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    billable: false,
  };

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.listExpenses().subscribe({
      next: (list) => this.expenses.set(list),
      error: () => this.error.set('Failed to load expenses'),
    });
  }

  openCreate() {
    this.form = {
      description: '',
      category: 'Software',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      billable: false,
    };
    this.showForm.set(true);
  }

  save() {
    this.api
      .createExpense({
        ...this.form,
        amount: Number(this.form.amount),
      })
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.reload();
        },
        error: (e) => this.error.set(e?.error?.message || 'Save failed'),
      });
  }

  remove(e: Expense) {
    if (!confirm(`Delete “${e.description}”?`)) return;
    this.api.deleteExpense(e.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }

  total() {
    return this.expenses().reduce((s, e) => s + Number(e.amount), 0);
  }
}
