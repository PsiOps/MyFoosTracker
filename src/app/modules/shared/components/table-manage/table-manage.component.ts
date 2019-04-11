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
  public isModal$: Promise<boolean>;
  constructor(public modalController: ModalController,
    private tableService: TableService) { }

  ngOnInit() {
    this.allTables$ = this.tableService.getAllTables$();
    this.isModal$ = this.modalController.getTop().then(m => m ? true : false);
  }

  public tableFavouriteChanged(table: TableManageModel) {
    if (table.isDefault) { return; }
    table.isFavourite = !table.isFavourite;

    if (table.isFavourite) {
      this.tableService.addTableToFavourites(table.id);
    } else {
      this.tableService.removeTableFromFavourites(table.id);
    }
  }

  public defaultTableChanged(table: TableManageModel) {
    table.isDefault = !table.isDefault;

    if (table.isDefault) {
      this.tableService.setTableAsDefault(table.id);
    } else {
      this.tableService.clearDefaultTable();
    }
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
