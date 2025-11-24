import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  errorMessage: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        console.log('✅ Registro exitoso', res);

        // Guarda token + user en el auth service
        if (this.authService['handleSuccessfulAuth']) {
          this.authService['handleSuccessfulAuth'](res);
        }

        // Redirige al perfil o home
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error en el registro';
      }
    });
  }
}