import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sin-datos-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="modal-contenedor">
      <header class="modal-cabecera">
        <h2 class="modal-titulo">Informacion de busqueda de cancelaciones</h2>
        <div class="cabecera-acciones">
          <div class="icono-alerta" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <button class="boton-cerrar" type="button" (click)="cerrar()" aria-label="Cerrar ventana">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <div class="modal-cuerpo">
        <p class="mensaje-alerta">
          ¡No se encontraron reservas canceladas para el período seleccionado!
        </p>
      </div>
    </div>
  `,
  styles: [`
    .modal-contenedor {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px 32px 36px;
      position: relative;
      min-width: 440px;
      max-width: 540px;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    .modal-cabecera {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    .modal-titulo {
      margin: 0;
      color: #6c757d;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.3;
      max-width: 280px;
    }

    .cabecera-acciones {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .icono-alerta svg {
      width: 58px;
      height: 58px;
      stroke-width: 1.8;
      color: #e53935;
    }

    .boton-cerrar {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #333333;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        color: #000000;
      }
    }

    .modal-cuerpo {
      padding: 10px 0 6px;
      text-align: center;
    }

    .mensaje-alerta {
      margin: 0;
      color: #e53935;
      font-size: 26px;
      font-weight: 700;
      line-height: 1.3;
    }

    @media (max-width: 540px) {
      .modal-contenedor {
        min-width: auto;
        width: 90vw;
        padding: 20px;
      }
      .mensaje-alerta {
        font-size: 20px;
      }
      .icono-alerta svg {
        width: 44px;
        height: 44px;
      }
    }
  `]
})
export class SinDatosModalComponent {
  constructor(public dialogRef: MatDialogRef<SinDatosModalComponent>) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
