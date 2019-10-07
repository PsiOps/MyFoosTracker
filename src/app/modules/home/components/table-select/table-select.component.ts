import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TableSelectDialogComponent } from './table-select-dialog/table-select-dialog.component';
import { Match, Table } from 'src/app/domain';
import { MatchService } from 'src/app/services/match.service';
import { TableService } from 'src/app/services/table.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-table-select',
  templateUrl: './table-select.component.html',
  styleUrls: ['./table-select.component.scss']
})
export class TableSelectComponent implements OnInit, OnChanges {
  @Input() match: Match;
  public currentTable$: Promise<Table>;
  constructor(
    private popoverController: PopoverController,
    private matchService: MatchService,
    private tableService: TableService
  ) {
    combineLatest([this.tableService.groupTables$, this.matchService.currentMatch$])
    .subscribe(([tables, match]) => {
      if (match && tables.length === 1) {
        this.matchService.setTable(match.groupId, tables[0].id);
      }
    });
  }

  ngOnInit() { }
  ngOnChanges() {
    if (this.match.tableRef) {
      this.currentTable$ = this.match.tableRef.get().then(s => s.data() as Table);
    }
  }

  public async pickTable() {
    const popover = await this.popoverController.create({
      component: TableSelectDialogComponent,
      translucent: true
    });
    popover.onWillDismiss().then(event => {
      const tableId = event.data;
      if (!tableId) { return; }
      this.matchService.setTable(this.match.groupId, tableId);
    });
    return await popover.present();
  }
}
