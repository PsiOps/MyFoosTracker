import { Component, OnInit } from '@angular/core';
import { TableSelectModel } from '../../../models/table-select.model';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-select-dialog',
  templateUrl: './table-select-dialog.component.html',
  styleUrls: ['./table-select-dialog.component.scss']
})
export class TableSelectDialogComponent implements OnInit {
  public tables$: Observable<TableSelectModel[]>;

  constructor(private popoverController: PopoverController,
    private tableService: TableService) { }

  ngOnInit() {
    this.tables$ = this.tableService.getTables$();
  }
  public onTableSelected(table: TableSelectModel): void {
    this.popoverController.dismiss(table.id);
  }
}
