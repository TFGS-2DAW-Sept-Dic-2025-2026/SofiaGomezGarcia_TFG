import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/registro/registro.component';
import { InformacionSerieComponent } from './componentes/informacion-serie/informacion-serie.component';
import { FavoritasComponent } from './componentes/favoritas/favoritas.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { ListasComponent } from './componentes/listas/listas.component';
import { ListaDetalleComponent } from './componentes/lista-detalle/lista-detalle.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { SeguimientoComponent } from './componentes/seguimiento/seguimiento.component';
import { DescubreComponent } from './componentes/descubre/descubre.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'registro', component: RegisterComponent, canActivate: [guestGuard] },
    { path: 'serie/:id', component: InformacionSerieComponent, canActivate: [authGuard] },
    { path: 'favoritas', component: FavoritasComponent, canActivate: [authGuard] },
    { path: 'listas', component: ListasComponent, canActivate: [authGuard] },
    { path: 'listas/:id', component: ListaDetalleComponent, canActivate: [authGuard] },
    { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
    { path: 'descubre', component:DescubreComponent, canActivate: [authGuard] },
    { path: 'seguimiento', component: SeguimientoComponent, canActivate: [authGuard] },

];
