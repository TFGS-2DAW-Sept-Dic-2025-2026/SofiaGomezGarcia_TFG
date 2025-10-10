import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import IJwtFormat from '../modelos/IJwtFormat';
import IUsuario from '../modelos/interfaces_orm/IUsuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5000/auth';

  // Signals para manejo de estado en memoria (MÁS SEGURO)
  private _jwt = signal<IJwtFormat>({
    sesion: '',
    verificacion: '',
    refresh: ''
  });

  private _datosUsuario = signal<IUsuario | undefined>(undefined);
  private _isAuthenticated = signal<boolean>(false);

  // Computed signals (valores derivados) - públicos para componentes
  public isAuthenticated$ = computed(() => this._isAuthenticated());
  public datosUsuario$ = computed(() => this._datosUsuario());
  public username$ = computed(() => this._datosUsuario()?.username || '');
  public hasValidSession = computed(() => {
    const jwt = this._jwt();
    return !!jwt.sesion && this._isAuthenticated();
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Intentar recuperar sesión al iniciar (OPCIONAL: solo si quieres persistencia)
    this.tryRecoverSession();
  }

  //#region ===================== MÉTODOS DE AUTENTICACIÓN =====================

  /**
   * Registro de nuevo usuario
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
    fotoPerfil?: string;
    biografia?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        if (response.token || response.jwt) {
          this.handleSuccessfulAuth(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login de usuario
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token || response.jwt) {
          this.handleSuccessfulAuth(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout - limpia toda la sesión
   */
  logout(): void {
    // Limpiar signals
    this._jwt.set({ sesion: '', verificacion: '', refresh: '' });
    this._datosUsuario.set(undefined);
    this._isAuthenticated.set(false);

    // Limpiar sessionStorage (si lo usas)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('jwt');
      sessionStorage.removeItem('refresh');
      sessionStorage.removeItem('datosUsuario');
      sessionStorage.removeItem('verificacion');
      sessionStorage.removeItem('sesion');
    }

    // Redirigir al login
    this.router.navigate(['/']);
  }

  //#endregion

  //#region ===================== GESTIÓN DE TOKENS JWT =====================

  /**
   * Obtiene el JWT completo
   */
  getJWT(): IJwtFormat {
    return this._jwt();
  }

  /**
   * Obtiene solo el token de sesión (para headers HTTP)
   */
  getSessionToken(): string {
    return this._jwt().sesion;
  }

  /**
   * Obtiene el token de refresh
   */
  getRefreshToken(): string {
    return this._jwt().refresh;
  }

  /**
   * Establece un token específico (sesion, refresh o verificacion)
   */
  setJwt(tipo: 'sesion' | 'verificacion' | 'refresh', value: string): void {
    this._jwt.update(prev => ({ ...prev, [tipo]: value }));

    // Actualizar estado de autenticación si es token de sesión
    if (tipo === 'sesion') {
      this._isAuthenticated.set(!!value);
    }

    // OPCIONAL: Persistir en sessionStorage (más seguro que localStorage)
    this.persistJwtToSessionStorage();
  }

  /**
   * Refresca el token de sesión usando el refresh token
   */
  refreshSession(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.http.post(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setJwt('sesion', response.token);
        }
      }),
      catchError(err => {
        // Si falla el refresh, hacer logout
        this.logout();
        return throwError(() => err);
      })
    );
  }

  //#endregion

  //#region ===================== GESTIÓN DE DATOS USUARIO =====================

  /**
   * Obtiene los datos del usuario
   */
  getDatosUsuario(): IUsuario | undefined {
    return this._datosUsuario();
  }

  /**
   * Establece los datos del usuario
   */
  setDatosUsuario(datosUsuario: IUsuario): void {
    this._datosUsuario.update(prev => {
      if (prev) {
        return { ...prev, ...datosUsuario };
      }
      return { ...datosUsuario };
    });

    // OPCIONAL: Persistir en sessionStorage
    this.persistUserDataToSessionStorage();
  }


  getUserName(): string {
    return this.getDatosUsuario()?.username || '';
  }

  /**
   * Actualiza el perfil del usuario
   */
  updatePerfil(datosActualizados: {
    username?: string;
    email?: string;
    fotoPerfil?: string;
    biografia?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, datosActualizados, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.usuario) {
          this.setDatosUsuario(response.usuario);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  cambiarPassword(datos: {
    passwordActual: string;
    passwordNueva: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/cambiar-password`, datos, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  //#endregion

  //#region ===================== GESTIÓN DE AMIGOS =====================

  /**
   * Obtiene la lista de amigos del usuario
   */
  getAmigos(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(`${this.apiUrl}/amigos`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envía solicitud de amistad
   */
  enviarSolicitudAmistad(usuarioId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/amigos/solicitud`,
      { usuarioId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Acepta una solicitud de amistad
   */
  aceptarSolicitudAmistad(usuarioId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/amigos/aceptar`,
      { usuarioId },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((response: any) => {
        // Actualizar lista de amigos en el signal
        if (response.usuario) {
          this.setDatosUsuario(response.usuario);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un amigo
   */
  eliminarAmigo(usuarioId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/amigos/${usuarioId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        // Actualizar lista de amigos en el signal
        if (response.usuario) {
          this.setDatosUsuario(response.usuario);
        }
      }),
      catchError(this.handleError)
    );
  }

  //#endregion

  //#region ===================== UTILIDADES Y HELPERS =====================

  /**
   * Maneja una autenticación exitosa
   */
  private handleSuccessfulAuth(response: any): void {
    // Si tu backend devuelve un objeto con estructura { jwt: {...}, usuario: {...} }
    if (response.jwt) {
      this._jwt.set(response.jwt);
    } else if (response.token) {
      // Si solo devuelve un token simple
      this.setJwt('sesion', response.token);
    }

    // Si también devuelve un refresh token por separado
    if (response.refreshToken) {
      this.setJwt('refresh', response.refreshToken);
    }

    if (response.usuario) {
      this.setDatosUsuario(response.usuario);
    }

    this._isAuthenticated.set(true);

    // Persistir datos
    this.persistJwtToSessionStorage();
    this.persistUserDataToSessionStorage();
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en AuthService:', error);
    return throwError(() => error);
  }

  /**
   * Intenta recuperar la sesión de sessionStorage al iniciar
   * NOTA: sessionStorage se borra al cerrar la pestaña (más seguro que localStorage)
   */
  private tryRecoverSession(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const jwtStr = sessionStorage.getItem('jwt');
      const usuarioStr = sessionStorage.getItem('datosUsuario');

      if (jwtStr) {
        const jwt = JSON.parse(jwtStr) as IJwtFormat;
        if (jwt.sesion) {
          this._jwt.set(jwt);
          this._isAuthenticated.set(true);
        }
      }

      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr) as IUsuario;
        this._datosUsuario.set(usuario);
      }
    } catch (error) {
      console.error('Error recuperando sesión:', error);
      this.logout();
    }
  }

  /**
   * Persiste el JWT en sessionStorage (OPCIONAL)
   * sessionStorage es más seguro que localStorage porque:
   * - Se borra al cerrar la pestaña
   * - No persiste entre sesiones del navegador
   */
  private persistJwtToSessionStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const jwt = this._jwt();
      sessionStorage.setItem('jwt', JSON.stringify(jwt));
    }
  }

  /**
   * Persiste datos del usuario en sessionStorage (OPCIONAL)
   */
  private persistUserDataToSessionStorage(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const usuario = this._datosUsuario();
      if (usuario) {
        // NO guardar el passwordHash en sessionStorage por seguridad
        const { passwordHash, ...usuarioSinPassword } = usuario;
        sessionStorage.setItem('datosUsuario', JSON.stringify(usuarioSinPassword));
      }
    }
  }

  /**
   * Crea headers HTTP con el token de autenticación
   */
  // getAuthHeaders(): HttpHeaders {
  //   const token = this.getSessionToken();
  //   return new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   });
  // }

  getAuthHeaders(): HttpHeaders {
    // Recuperar token correctamente, incluso si viene de sessionStorage
    let token = this._jwt().sesion;

    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      const jwtStr = sessionStorage.getItem('jwt');
      if (jwtStr) {
        try {
          const jwt = JSON.parse(jwtStr);
          token = jwt.sesion;
        } catch (e) {
          console.error('Error al parsear el JWT desde sessionStorage:', e);
        }
      }
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  //#endregion


  subirFotoPerfil(formData: FormData) {
    return this.http.post<{ url: string }>('http://localhost:5000/auth/foto', formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getSessionToken() || ''}`
      })
    });
  }

  actualizarDatosUsuario(datos: Partial<IUsuario>): void {
    this._datosUsuario.update(prev => {
      if (prev) {
        return { ...prev, ...datos };
      }
      return { ...datos } as IUsuario;
    });

    // Persistir en sessionStorage
    this.persistUserDataToSessionStorage();
  }


}