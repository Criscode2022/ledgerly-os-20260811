import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `<div class="min-h-screen grid place-items-center text-muted">Loading Ledgerly…</div>`,
})
export class LandingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  ngOnInit() {
    this.router.navigateByUrl(this.auth.isAuthenticated() ? '/app' : '/login');
  }
}
