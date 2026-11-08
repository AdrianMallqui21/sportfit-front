import {Component, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute} from '@angular/router';
import {UsuarioModelo} from '../../modelos/usuario-modelo';

@Component({
  imports: [MatCardModule, MatButtonModule],
  selector: 'app-a2-perfil-administrador-componente',
  styleUrl: './a2-perfil-administrador-componente.css',
  templateUrl: './a2-perfil-administrador-componente.html',
})
export class A2PerfilAdministradorComponente {
  route: ActivatedRoute = inject(ActivatedRoute);
  idAdmin: number;
  usuario: UsuarioModelo = new UsuarioModelo();

  ngOnInit(): void {
    this.usuario = history.state.usuario ?? null;
    if (this.usuario) {
      console.log("Usuario recibido:", this.usuario);
    } else {
      console.log("Error al cargar usuario");
    }
  }


  // Cargar información de administrador

  // Cambiar información de administrador


}
