import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TableManageModel } from 'src/app/modules/shared/models/table-manage.model';
import { ModalController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-manage',
  templateUrl: './table-manage.component.html',
  styleUrls: ['./table-manage.component.scss']
})
export class TableManageComponent implements OnInit {
  public allTables$: Observable<TableManageModel[]>;
  public isModal$: Promise<boolean>; // TODO: This should be an @Input()?
  public terms = '';

  constructor(public modalController: ModalController,
    private tableService: TableService) { }

  ngOnInit() {
    this.isModal$ = this.modalController.getTop().then(m => m ? true : false);
  }

  public async defaultTableChanged(table: TableManageModel) {
    table.isDefault = !table.isDefault;

    if (table.isDefault) {
      await this.tableService.setTableAsDefault(table);
    } else {
      await this.tableService.clearDefaultTable(table);
    }
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
