import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { Expense } from '../expenses/expense.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly items: Repository<InvoiceItem>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED === 'false') return;
    const count = await this.users.count();
    if (count > 0) {
      this.log.log('Database already has users — skip seed');
      return;
    }
    this.log.log('Seeding demo data…');
    const passwordHash = await bcrypt.hash('demo1234', 10);
    const user = await this.users.save(
      this.users.create({
        email: 'demo@ledgerly.app',
        passwordHash,
        name: 'Alex Morgan',
        company: 'Morgan Studio',
        currency: 'USD',
      }),
    );

    const clientData = [
      {
        name: 'Northwind Labs',
        email: 'ap@northwind.dev',
        company: 'Northwind Labs Inc.',
        phone: '+1 415 555 0142',
      },
      {
        name: 'Brightline Agency',
        email: 'billing@brightline.co',
        company: 'Brightline Co.',
        phone: '+1 646 555 0198',
      },
      {
        name: 'Harbor Health',
        email: 'finance@harbor.health',
        company: 'Harbor Health LLC',
        phone: '+1 312 555 0177',
      },
    ];
    const clients = await this.clients.save(
      clientData.map((c) => this.clients.create({ ...c, userId: user.id })),
    );

    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const monthsAgo = (n: number) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - n);
      return d;
    };

    const invSpecs = [
      {
        client: clients[0],
        status: 'paid' as const,
        months: 4,
        items: [
          { description: 'Brand system redesign', quantity: 1, unitPrice: 4800 },
          { description: 'Design system documentation', quantity: 1, unitPrice: 1200 },
        ],
      },
      {
        client: clients[1],
        status: 'paid' as const,
        months: 3,
        items: [
          { description: 'Marketing site rebuild', quantity: 1, unitPrice: 6500 },
        ],
      },
      {
        client: clients[2],
        status: 'paid' as const,
        months: 2,
        items: [
          { description: 'Patient portal UX audit', quantity: 40, unitPrice: 125 },
        ],
      },
      {
        client: clients[0],
        status: 'sent' as const,
        months: 0,
        items: [
          { description: 'Dashboard prototype', quantity: 1, unitPrice: 3200 },
          { description: 'Interaction polish', quantity: 8, unitPrice: 150 },
        ],
      },
      {
        client: clients[1],
        status: 'overdue' as const,
        months: 1,
        items: [
          { description: 'Campaign landing pages', quantity: 3, unitPrice: 900 },
        ],
      },
      {
        client: clients[2],
        status: 'draft' as const,
        months: 0,
        items: [
          { description: 'Accessibility remediation', quantity: 16, unitPrice: 140 },
        ],
      },
    ];

    let n = 1;
    for (const spec of invSpecs) {
      const issue = monthsAgo(spec.months);
      const due = new Date(issue);
      due.setDate(due.getDate() + 30);
      const taxRate = 8.5;
      const subtotal = spec.items.reduce(
        (s, i) => s + i.quantity * i.unitPrice,
        0,
      );
      const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;
      const inv = await this.invoices.save(
        this.invoices.create({
          number: `INV-${issue.getFullYear()}-${String(n).padStart(4, '0')}`,
          status: spec.status,
          issueDate: iso(issue),
          dueDate: iso(due),
          subtotal,
          taxRate,
          taxAmount,
          total,
          paidAt: spec.status === 'paid' ? iso(due) : null,
          userId: user.id,
          clientId: spec.client.id,
          notes: 'Thank you for your business.',
        }),
      );
      await this.items.save(
        spec.items.map((i) =>
          this.items.create({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            amount: i.quantity * i.unitPrice,
            invoiceId: inv.id,
          }),
        ),
      );
      n += 1;
    }

    const expSpecs = [
      { description: 'Figma Professional', category: 'Software', amount: 45, months: 0 },
      { description: 'AWS hosting', category: 'Infrastructure', amount: 128.4, months: 0 },
      { description: 'Domain renewals', category: 'Infrastructure', amount: 42, months: 1 },
      { description: 'Stock photography', category: 'Marketing', amount: 89, months: 1 },
      { description: 'Coworking desk', category: 'Office', amount: 350, months: 0 },
      { description: 'Client travel', category: 'Travel', amount: 612.5, months: 2 },
      { description: 'Accounting software', category: 'Software', amount: 30, months: 2 },
      { description: 'Online course', category: 'Education', amount: 199, months: 3 },
    ];
    await this.expenses.save(
      expSpecs.map((e) =>
        this.expenses.create({
          description: e.description,
          category: e.category,
          amount: e.amount,
          date: iso(monthsAgo(e.months)),
          billable: e.category === 'Travel',
          userId: user.id,
        }),
      ),
    );

    this.log.log('Seed complete — demo@ledgerly.app / demo1234');
  }
}
