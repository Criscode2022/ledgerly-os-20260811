export interface User {
  id: string;
  email: string;
  name: string;
  company?: string | null;
  currency: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paidAt?: string | null;
  clientId: string;
  client?: Client;
  items: InvoiceItem[];
  createdAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  billable: boolean;
}

export interface DashboardSummary {
  metrics: {
    revenue: number;
    outstanding: number;
    expenses: number;
    net: number;
    clientCount: number;
    invoiceCount: number;
  };
  monthly: { key: string; label: string; revenue: number; expenses: number }[];
  byStatus: Record<string, number>;
  expenseByCategory: Record<string, number>;
  recentInvoices: Invoice[];
}
