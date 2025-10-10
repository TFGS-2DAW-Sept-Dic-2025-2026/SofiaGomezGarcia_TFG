import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { log } from 'console';

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

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
  if (this.registerForm.invalid) return;

  // el register() devuelve un observable
  this.authService.register(this.registerForm.value).subscribe({ 
    next: (res) => {
     
      console.log('Registro exitoso', res.msg);
      this.router.navigate(['/']); 
    },
    error: (err) => {
      this.errorMessage = err.error?.msg || 'Error en el registro';
    }
  });
}


  //para hacer visible la password

  // SetRePassVisible() {
  //   this.repassVisible.set( ! this.repassVisible() );
  // }
  // SetPassVisible() {
  //   this.passVisible.set( ! this.passVisible() );
  // }




}