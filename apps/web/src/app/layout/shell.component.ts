import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  auth = inject(AuthService);
  mobileOpen = signal(false);

  nav = [
    { path: '/app', label: 'Dashboard', exact: true },
    { path: '/app/clients', label: 'Clients', exact: false },
    { path: '/app/invoices', label: 'Invoices', exact: false },
    { path: '/app/expenses', label: 'Expenses', exact: false },
  ];

  toggle() {
    this.mobileOpen.update((v) => !v);
  }

  close() {
    this.mobileOpen.set(false);
  }
}
