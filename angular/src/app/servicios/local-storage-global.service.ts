import { Injectable } from '@angular/core';
import IStorageService from '../modelos/IStorageService';
import IJwtFormat from '../modelos/IJwtFormat';
import IUsuario from '../modelos/interfaces_orm/IUsuario';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageGlobalService implements IStorageService {

  constructor() { }
  

  


  
  getJWT():IJwtFormat {
    return JSON.parse(localStorage.getItem('jwt')!) as IJwtFormat ?? undefined;
  }
  
  getCodigoVerificacion(): string{
    return localStorage.getItem('codigo') ?? '';
  }

  getDatosUsuario(): IUsuario | undefined{
    return JSON.parse(localStorage.getItem('datosUsuario')!) as IUsuario ?? undefined
  }

  setJwt(tipo: string, value: string){
    
     
    if(!! localStorage.getItem('jwt')){
       var _jwtEnStorage:IJwtFormat = JSON.parse(localStorage.getItem('jwt')!);      
     } else {
       var _jwtEnStorage:IJwtFormat={sesion:'', refresh:'', verificacion:''};
    }

      _jwtEnStorage={ ..._jwtEnStorage, [tipo]: value }; 
      localStorage.setItem('jwt', JSON.stringify(_jwtEnStorage))
      

  }
  
  setCodigoVerificacion(codigo: string){
     localStorage.setItem('codigo', codigo);
  }

  setDatosUsuario(datosUsuario: IUsuario){
    
  }
}
