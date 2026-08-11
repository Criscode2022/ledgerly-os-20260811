import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Client } from '../clients/client.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Expense, Client])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
