import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CostoEstimadoModalData {
  monto?: string;
  mes?: string;
  anio?: string;
}

@Component({
  selector: 'app-costo-estimado-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="modal-contenedor">
      <header class="modal-cabecera">
        <h2 class="modal-titulo">Costo estimado de perdida</h2>
        <button class="boton-cerrar" type="button" (click)="cerrar()" aria-label="Cerrar ventana">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div class="modal-cuerpo">
        <div class="bloque-monto">
          <span class="monto-valor">{{ data?.monto || 'S/20 000' }}</span>
        </div>

        <div class="bloque-periodo">
          <span class="periodo-mes">{{ data?.mes || 'JUN' }}</span>
          <span class="periodo-anio">{{ data?.anio || '2026' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-contenedor {
      background: #ffffff;
      border-radius: 18px;
      padding: 24px 32px 36px;
      position: relative;
      min-width: 420px;
      max-width: 500px;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    .modal-cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .modal-titulo {
      margin: 0;
      color: #6c757d;
      font-size: 20px;
      font-weight: 600;
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
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 20px;
      padding: 10px 0;
    }

    .bloque-monto {
      display: flex;
      align-items: center;
    }

    .monto-valor {
      color: #008fa0;
      font-size: 44px;
      font-weight: 800;
      letter-spacing: -0.5px;
      white-space: nowrap;
    }

    .bloque-periodo {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.05;
    }

    .periodo-mes,
    .periodo-anio {
      color: #f4c430;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 1px;
      text-shadow: 1px 1px 0px #b89115;
    }

    @media (max-width: 500px) {
      .modal-contenedor {
        min-width: auto;
        width: 90vw;
        padding: 20px;
      }
      .monto-valor {
        font-size: 32px;
      }
      .periodo-mes,
      .periodo-anio {
        font-size: 28px;
      }
    }
  `]
})
export class CostoEstimadoModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CostoEstimadoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CostoEstimadoModalData
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
