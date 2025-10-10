import { Injectable, signal } from '@angular/core';
import IStorageService from '../modelos/IStorageService';
import IUsuario from '../modelos/interfaces_orm/IUsuario';
import IJwtFormat from '../modelos/IJwtFormat';


@Injectable({
  providedIn: 'root'
})
export class StorageGlobalService implements IStorageService {

  private _jwt = signal<IJwtFormat>({ sesion: '', verificacion:'', refresh:'' });
  private _codigo = signal<string>('');
  private _datosUsuario = signal<IUsuario | undefined>(undefined);


  
  constructor() { }
  
  //#region --------------------------- métodos para gestionar datos entre componentes zonaUsuario --------
  
  getJWT(): IJwtFormat {
    return this._jwt();
  }
  
  getCodigoVerificacion(): string {
    return this._codigo();
  }

  getDatosUsuario(): IUsuario | undefined {
    return this._datosUsuario();
  }

  setJwt(tipo: string, value: string) {
    
    this._jwt.update(valorprev => ({ ...valorprev, [tipo]: value }));
  }
  
  setCodigoVerificacion(codigo: string) {
    this._codigo.set(codigo);
  }

  setDatosUsuario(datosUsuario: IUsuario) {
    this._datosUsuario.update(
      valorprev => {
        if (!!valorprev) {
          return { ...valorprev, ...datosUsuario };
        } else {
          return { ...datosUsuario };
        }
      }
    );
  }
  
  //#endregion

  
}