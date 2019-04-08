import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TableSelectModel } from './table-select.model';
import { ModalController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-select',
  templateUrl: './table-select.component.html',
  styleUrls: ['./table-select.component.scss']
})
export class TableSelectComponent implements OnInit {
  public tables$: Observable<TableSelectModel[]>;

  constructor(private modalController: ModalController,
    private tableService: TableService) { }

  ngOnInit() {
    this.tables$ = this.tableService.getTables$();
  }

  public tableFavouriteChanged(table: TableSelectModel) {
    table.isFavourite = !table.isFavourite;

    if (table.isFavourite) {
      this.tableService.addTableToFavourites(table.id);
    } else {
      this.tableService.removeTableFromFavourites(table.id);
    }
  }

  public defaultTableChanged(table: TableSelectModel) {
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
