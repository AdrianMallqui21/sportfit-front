import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DatosComprobanteDialogo {
  urlComprobante: string;
}

@Component({
  selector: 'app-a8-comprobante-pago-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './a8-comprobante-pago-dialogo.html',
  styleUrl: './a8-comprobante-pago-dialogo.css'
})
export class A8ComprobantePagoDialogo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DatosComprobanteDialogo) {}

  onVoucherError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('comprobante-yape.png')) {
      img.src = '/imagenes/comprobante-yape.png';
    }
  }
}
