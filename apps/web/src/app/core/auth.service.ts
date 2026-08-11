import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthResponse, User } from './models';

const TOKEN_KEY = 'ledgerly_token';
const USER_KEY = 'ledgerly_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private userSignal = signal<User | null>(this.readUser());
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.userSignal() && !!this.token);

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.userSignal.set(res.user);
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(tap((r) => this.persist(r)));
  }

  register(data: { email: string; password: string; name: string; company?: string }) {
    return this.api.register(data).pipe(tap((r) => this.persist(r)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigateByUrl('/login');
  }
}
