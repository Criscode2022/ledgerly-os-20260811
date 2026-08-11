import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { LandingComponent } from './pages/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ShellComponent } from './layout/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { InvoiceDetailComponent } from './pages/invoices/invoice-detail.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'invoices/:id', component: InvoiceDetailComponent },
      { path: 'expenses', component: ExpensesComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
