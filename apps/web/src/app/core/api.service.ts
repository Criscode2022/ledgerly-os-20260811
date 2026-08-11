import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  Client,
  DashboardSummary,
  Expense,
  Invoice,
  User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  register(body: { email: string; password: string; name: string; company?: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, body);
  }

  login(body: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, body);
  }

  me() {
    return this.http.get<User>(`${this.base}/auth/me`);
  }

  dashboard() {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }

  listClients(q?: string) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Client[]>(`${this.base}/clients`, { params });
  }

  getClient(id: string) {
    return this.http.get<Client>(`${this.base}/clients/${id}`);
  }

  createClient(body: Partial<Client>) {
    return this.http.post<Client>(`${this.base}/clients`, body);
  }

  updateClient(id: string, body: Partial<Client>) {
    return this.http.patch<Client>(`${this.base}/clients/${id}`, body);
  }

  deleteClient(id: string) {
    return this.http.delete(`${this.base}/clients/${id}`);
  }

  listInvoices(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Invoice[]>(`${this.base}/invoices`, { params });
  }

  getInvoice(id: string) {
    return this.http.get<Invoice>(`${this.base}/invoices/${id}`);
  }

  createInvoice(body: unknown) {
    return this.http.post<Invoice>(`${this.base}/invoices`, body);
  }

  updateInvoice(id: string, body: unknown) {
    return this.http.patch<Invoice>(`${this.base}/invoices/${id}`, body);
  }

  deleteInvoice(id: string) {
    return this.http.delete(`${this.base}/invoices/${id}`);
  }

  listExpenses(category?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<Expense[]>(`${this.base}/expenses`, { params });
  }

  createExpense(body: Partial<Expense>) {
    return this.http.post<Expense>(`${this.base}/expenses`, body);
  }

  updateExpense(id: string, body: Partial<Expense>) {
    return this.http.patch<Expense>(`${this.base}/expenses/${id}`, body);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.base}/expenses/${id}`);
  }
}
