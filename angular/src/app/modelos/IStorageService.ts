import IJwtFormat from './IJwtFormat';
import IUsuario from './interfaces_orm/IUsuario';

/**
 * Interfaz para servicios de almacenamiento de datos en la aplicación.
 * Define los métodos que deben implementar tanto el servicio en memoria (signals)
 * como el servicio de localStorage/sessionStorage.
 */
export default interface IStorageService {
  
  // ========== Gestión de JWT ==========
  
  /**
   * Obtiene el objeto JWT completo con todos los tokens
   */
  getJWT(): IJwtFormat;
  
  /**
   * Establece un token específico (sesion, verificacion o refresh)
   * @param tipo - Tipo de token a establecer
   * @param value - Valor del token
   */
  setJwt(tipo: string, value: string): void;
  
  // ========== Gestión de código de verificación ==========
  
  /**
   * Obtiene el código de verificación temporal
   */
  getCodigoVerificacion(): string;
  
  /**
   * Establece el código de verificación temporal
   * @param codigo - Código de verificación
   */
  setCodigoVerificacion(codigo: string): void;
  
  // ========== Gestión de datos de usuario ==========
  
  /**
   * Obtiene los datos del usuario autenticado
   */
  getDatosUsuario(): IUsuario | undefined;
  
  /**
   * Establece o actualiza los datos del usuario
   * @param datosUsuario - Datos del usuario a almacenar
   */
  setDatosUsuario(datosUsuario: IUsuario): void;
  
  // ========== Gestión de pedidos (zona tienda) ==========
  
  /**
   * Obtiene el pedido actual en proceso
   */
  
}