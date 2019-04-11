import { Component, OnInit } from '@angular/core';
import { TableSelectModel } from '../../../../shared/models/table-select.model';
import { PopoverController, ModalController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';
import { TableManageComponent } from 'src/app/modules/shared/components/table-manage/table-manage.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table-select-dialog',
  templateUrl: './table-select-dialog.component.html',
  styleUrls: ['./table-select-dialog.component.scss']
})
export class TableSelectDialogComponent implements OnInit {

  public playerTables$: Observable<TableSelectModel[]>;
  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,
    public tableService: TableService) { }

  ngOnInit() {
    this.playerTables$ = this.tableService.getPlayerTables$();
  }

  public onTableSelected(table: TableSelectModel): void {
    this.popoverController.dismiss(table.id);
  }

  public async goToTableManagement() {
    const modal = await this.modalController.create({
      component: TableManageComponent
    });
    return await modal.present();
  }
}
