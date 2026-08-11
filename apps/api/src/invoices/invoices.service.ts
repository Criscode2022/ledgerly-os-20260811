import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly items: Repository<InvoiceItem>,
    private readonly clients: ClientsService,
  ) {}

  findAll(userId: string, status?: string) {
    const where: { userId: string; status?: InvoiceStatus } = { userId };
    if (status) where.status = status as InvoiceStatus;
    return this.invoices.find({
      where,
      relations: { client: true },
      order: { issueDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const inv = await this.invoices.findOne({
      where: { id, userId },
      relations: { client: true, items: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  private calc(items: { quantity: number; unitPrice: number }[], taxRate: number) {
    const subtotal = items.reduce(
      (s, i) => s + Number(i.quantity) * Number(i.unitPrice),
      0,
    );
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      total,
    };
  }

  private async nextNumber(userId: string) {
    const count = await this.invoices.count({ where: { userId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    await this.clients.findOne(userId, dto.clientId);
    const taxRate = dto.taxRate ?? 0;
    const totals = this.calc(dto.items, taxRate);
    const number = await this.nextNumber(userId);
    const inv = this.invoices.create({
      number,
      userId,
      clientId: dto.clientId,
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      taxRate,
      notes: dto.notes,
      status: (dto.status as InvoiceStatus) || 'draft',
      ...totals,
      paidAt: dto.status === 'paid' ? dto.issueDate : null,
      items: dto.items.map((i) =>
        this.items.create({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: Math.round(i.quantity * i.unitPrice * 100) / 100,
        }),
      ),
    });
    return this.invoices.save(inv);
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto) {
    const inv = await this.findOne(userId, id);
    if (dto.clientId) {
      await this.clients.findOne(userId, dto.clientId);
      inv.clientId = dto.clientId;
    }
    if (dto.issueDate) inv.issueDate = dto.issueDate;
    if (dto.dueDate) inv.dueDate = dto.dueDate;
    if (dto.taxRate !== undefined) inv.taxRate = dto.taxRate;
    if (dto.notes !== undefined) inv.notes = dto.notes;
    if (dto.status) {
      inv.status = dto.status as InvoiceStatus;
      inv.paidAt = dto.status === 'paid' ? new Date().toISOString().slice(0, 10) : null;
    }
    if (dto.items) {
      await this.items.delete({ invoiceId: inv.id });
      const totals = this.calc(dto.items, Number(inv.taxRate));
      Object.assign(inv, totals);
      inv.items = dto.items.map((i) =>
        this.items.create({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          amount: Math.round(i.quantity * i.unitPrice * 100) / 100,
          invoiceId: inv.id,
        }),
      );
    } else if (dto.taxRate !== undefined) {
      const totals = this.calc(
        inv.items.map((i) => ({
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        Number(inv.taxRate),
      );
      Object.assign(inv, totals);
    }
    return this.invoices.save(inv);
  }

  async remove(userId: string, id: string) {
    const inv = await this.findOne(userId, id);
    await this.invoices.remove(inv);
    return { ok: true };
  }
}
