import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
  ) {}

  findAll(userId: string, category?: string) {
    const where: { userId: string; category?: string } = { userId };
    if (category) where.category = category;
    return this.expenses.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const exp = await this.expenses.findOne({ where: { id, userId } });
    if (!exp) throw new NotFoundException('Expense not found');
    return exp;
  }

  create(userId: string, dto: CreateExpenseDto) {
    const exp = this.expenses.create({
      ...dto,
      billable: dto.billable ?? false,
      userId,
    });
    return this.expenses.save(exp);
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const exp = await this.findOne(userId, id);
    Object.assign(exp, dto);
    return this.expenses.save(exp);
  }

  async remove(userId: string, id: string) {
    const exp = await this.findOne(userId, id);
    await this.expenses.remove(exp);
    return { ok: true };
  }
}
