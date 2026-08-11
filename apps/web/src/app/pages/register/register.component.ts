import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  company = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        company: this.company || undefined,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/app');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Registration failed');
        },
      });
  }
}
