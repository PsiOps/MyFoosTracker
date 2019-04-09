import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TableSelectModel } from '../../models/table-select.model';
import { PopoverController } from '@ionic/angular';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-table-select',
  templateUrl: './table-select.component.html',
  styleUrls: ['./table-select.component.scss']
})
export class TableSelectComponent implements OnInit {
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
