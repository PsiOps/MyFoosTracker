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
  public tables$: Observable<TableManageModel[]>;

  constructor(private modalController: ModalController,
    private tableService: TableService) { }

  ngOnInit() {
    this.tables$ = this.tableService.getTables$();
  }

  public tableFavouriteChanged(table: TableManageModel) {
    table.isFavourite = !table.isFavourite;

    if (table.isFavourite) {
      this.tableService.addTableToFavourites(table.id);
    } else {
      this.tableService.removeTableFromFavourites(table.id);
    }
  }

  public defaultTableChanged(table: TableManageModel) {
    table.isFavourite = !table.isFavourite;

    if (table.isFavourite) {
      this.tableService.addTableToFavourites(table.id);
    } else {
      this.tableService.removeTableFromFavourites(table.id);
    }
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
