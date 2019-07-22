import { Injectable } from '@angular/core';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Table, Player, Group } from '../domain';
import { TableManageModel } from '../modules/shared/models/table-manage.model';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  constructor(
    public playerService: PlayerService,
  ) {
    const groupTablesObs$ = combineLatest([
      this.playerService.currentGroupTables$,
      this.playerService.player$,
      this.playerService.currentGroup$
    ]).pipe(map(([tables, player, group]) => tables
      .map(table => this.toTableManageModel(table, player, group))
      .sort((a, b) => this.sortTablesByIsDefault(a, b)
      )));
    groupTablesObs$.subscribe(value => this.groupTables$.next(value));
  }

  public groupTables$: BehaviorSubject<TableManageModel[]> = new BehaviorSubject([]);

  private toTableManageModel(table: Table, player: Player, group: Group): TableManageModel {
    const tableManageModel = new TableManageModel();
    tableManageModel.id = table.id;
    tableManageModel.name = table.name;
    tableManageModel.location = table.location;
    tableManageModel.isDefault = player.defaultTableIdByGroup && player.defaultTableIdByGroup[group.id] === table.id;
    tableManageModel.groupId = group.id;
    return tableManageModel;
  }

  private sortTablesByIsDefault(a: TableManageModel, b: TableManageModel): number {
    const aScore = a.isDefault ? 1 : 0;
    const bScore = b.isDefault ? 1 : 0;
    if (aScore === bScore) {
      return 0;
    }
    return bScore > aScore ? 1 : -1;
  }
}
