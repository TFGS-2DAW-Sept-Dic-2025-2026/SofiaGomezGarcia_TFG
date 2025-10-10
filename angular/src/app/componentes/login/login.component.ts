import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
auth = inject(AuthService);


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    // Llamada al servicio de autenticación
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Redirigir al home/dashboard automáticamente
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error en el login';
      }
    });
  }

  // Opcional: obtener el username directamente del servicio
  get username(): string {
    return this.authService.datosUsuario$()?.username || '';
  }

  // Opcional: verificar si hay sesión activa
  get isAuthenticated(): boolean {
    return this.authService.hasValidSession();
  }
}