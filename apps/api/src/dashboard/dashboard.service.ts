import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Client } from '../clients/client.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
  ) {}

  async summary(userId: string) {
    const [invoices, expenses, clientCount] = await Promise.all([
      this.invoices.find({ where: { userId }, relations: { client: true } }),
      this.expenses.find({ where: { userId } }),
      this.clients.count({ where: { userId } }),
    ]);

    const paid = invoices.filter((i) => i.status === 'paid');
    const outstanding = invoices.filter((i) =>
      ['sent', 'overdue'].includes(i.status),
    );
    const revenue = paid.reduce((s, i) => s + Number(i.total), 0);
    const outstandingTotal = outstanding.reduce(
      (s, i) => s + Number(i.total),
      0,
    );
    const expenseTotal = expenses.reduce((s, i) => s + Number(i.amount), 0);

    // last 6 months revenue/expense series
    const months: { key: string; label: string; revenue: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short' });
      months.push({ key, label, revenue: 0, expenses: 0 });
    }
    for (const inv of paid) {
      const key = String(inv.paidAt || inv.issueDate).slice(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) m.revenue += Number(inv.total);
    }
    for (const exp of expenses) {
      const key = String(exp.date).slice(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) m.expenses += Number(exp.amount);
    }

    const byStatus: Record<string, number> = {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      void: 0,
    };
    for (const inv of invoices) {
      byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
    }

    const expenseByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      expenseByCategory[exp.category] =
        (expenseByCategory[exp.category] || 0) + Number(exp.amount);
    }

    const recentInvoices = [...invoices]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      metrics: {
        revenue: Math.round(revenue * 100) / 100,
        outstanding: Math.round(outstandingTotal * 100) / 100,
        expenses: Math.round(expenseTotal * 100) / 100,
        net: Math.round((revenue - expenseTotal) * 100) / 100,
        clientCount,
        invoiceCount: invoices.length,
      },
      monthly: months.map((m) => ({
        ...m,
        revenue: Math.round(m.revenue * 100) / 100,
        expenses: Math.round(m.expenses * 100) / 100,
      })),
      byStatus,
      expenseByCategory,
      recentInvoices,
    };
  }
}
