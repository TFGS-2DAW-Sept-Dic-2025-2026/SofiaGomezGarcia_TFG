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
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordValidator
      ]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        console.log('Registro exitoso', res);

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

  passwordValidator(control: any) {
    const value = control.value || '';

    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[\W_]/.test(value);
    const minLength = value.length >= 6;

    return hasUpper && hasNumber && hasSpecial && minLength
      ? null
      : { weakPassword: true };
  }

  passwordHas(type: string) {
  const value = this.registerForm.get('password')?.value || '';

  switch (type) {
    case 'upper': return /[A-Z]/.test(value);
    case 'number': return /\d/.test(value);
    case 'special': return /[\W_]/.test(value);
    case 'length': return value.length >= 6;
    default: return false;
  }
}

}