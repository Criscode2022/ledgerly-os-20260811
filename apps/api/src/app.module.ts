import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { existsSync } from 'fs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { AppController } from './app.controller';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceItem } from './invoices/invoice-item.entity';
import { Expense } from './expenses/expense.entity';

const webDistCandidates = [
  join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
  join(__dirname, '..', '..', 'web', 'dist', 'web'),
  join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
  join(process.cwd(), 'apps', 'web', 'dist', 'web'),
];
const webRoot = webDistCandidates.find((p) => existsSync(p));

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        if (url) {
          // Neon / Postgres
          return {
            type: 'postgres' as const,
            url,
            entities: [User, Client, Invoice, InvoiceItem, Expense],
            synchronize: true,
            ssl: url.includes('sslmode=require') || url.includes('neon.tech')
              ? { rejectUnauthorized: false }
              : undefined,
          };
        }
        // Local fallback (no Neon URL) — sql.js so preview always works without native deps
        return {
          type: 'sqljs' as const,
          location: config.get<string>('SQLITE_PATH') || join(process.cwd(), 'ledgerly.sqlite'),
          autoSave: true,
          entities: [User, Client, Invoice, InvoiceItem, Expense],
          synchronize: true,
        };
      },
    }),
    ...(webRoot
      ? [
          ServeStaticModule.forRoot({
            rootPath: webRoot,
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    AuthModule,
    UsersModule,
    ClientsModule,
    InvoicesModule,
    ExpensesModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
