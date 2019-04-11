import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TableSelectDialogComponent } from './table-select-dialog/table-select-dialog.component';
import { Match, Table } from 'src/app/domain';
import { MatchService } from 'src/app/services/match.service';

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
    private matchService: MatchService
    ) { }

  ngOnInit() { }
  ngOnChanges() {
    this.currentTable$ = this.match.tableRef.get().then(s => s.data() as Table);
  }

  public async pickTable() {
    const popover = await this.popoverController.create({
      component: TableSelectDialogComponent,
      translucent: true
    });
    popover.onWillDismiss().then(event => {
      const tableId = event.data;
      if (!tableId) { return; }
      this.matchService.setTable(tableId);
    });
    return await popover.present();
  }
}
