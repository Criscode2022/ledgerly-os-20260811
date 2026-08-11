import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ default: 'USD' })
  currency: string;

  @OneToMany(() => Client, (c) => c.user)
  clients: Client[];

  @OneToMany(() => Invoice, (i) => i.user)
  invoices: Invoice[];

  @OneToMany(() => Expense, (e) => e.user)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
