import { Component } from '@angular/core';
import { TableSelectModel } from '../../../../shared/models/table-select.model';
import { PopoverController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table-select-dialog',
  templateUrl: './table-select-dialog.component.html',
  styleUrls: ['./table-select-dialog.component.scss']
})
export class TableSelectDialogComponent {

  public playerTables$: Observable<TableSelectModel[]>;
  constructor(
    private popoverController: PopoverController,
    public tableService: TableService) { }

  public onTableSelected(table: TableSelectModel): void {
    this.popoverController.dismiss(table.id);
  }

}
