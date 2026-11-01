import { Component } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatPaginator,
  ],
  selector: 'app-c4-home-cliente-componente',
  styleUrl: './c4-home-cliente-componente.css',
  templateUrl: './c4-home-cliente-componente.html',
})
export class C4HomeClienteComponente {
  //Modificar con campos finales
  displayedColumns: string[] = ['deporte', 'sede', 'fecha', 'hora'];
  //Obtener del backend
  dataSource = [
    {
      deporte: 'Fútbol',
      sede: 'Santiago de Surco',
      fecha: '03/09/2026',
      hora: '8 am - 10 am',
    },
  ];
}
