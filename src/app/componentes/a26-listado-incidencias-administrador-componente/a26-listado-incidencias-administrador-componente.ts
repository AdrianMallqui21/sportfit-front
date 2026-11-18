import {Component} from '@angular/core';
import {MatCard} from '@angular/material/card';
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
  MatTable
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {DataSource} from '@angular/cdk/table';
import {Observable} from 'rxjs';
import {DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';

@Component({
  imports: [
    MatCard,
    MatTable,
    MatSort,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatPaginator,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    DatePipe,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSelect,
    MatButton,
    MatInput,
    MatHint
  ],
  selector: 'app-a26-listado-incidencias-administrador-componente',
  styleUrl: './a26-listado-incidencias-administrador-componente.css',
  templateUrl: './a26-listado-incidencias-administrador-componente.html',
})
export class A26ListadoIncidenciasAdministradorComponente {
  protected dataSource: any[] | DataSource<any> | Observable<any[]>;
  protected displayedColumns: Iterable<string, any, any>;


}
