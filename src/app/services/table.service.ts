import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { DocumentChangeAction } from '@angular/fire/firestore';
import { map, switchMap, take } from 'rxjs/operators';
import { Table, Player } from '../domain';
import { TableManageModel } from '../modules/shared/models/table-manage.model';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  constructor(
    public authService: AuthenticationService,
    private groupService: GroupService
  ) {
    this.groupTablesObs$ = this.groupService.currentGroupTablesCollection$
      .pipe(switchMap(col => combineLatest([
        col.snapshotChanges(),
        this.authService.playerDoc.valueChanges(),
        this.groupService.currentGroupDocument$.pipe(take(1))
      ])
        .pipe(map(data => {
          const tableDocs = data[0];
          const player = data[1];
          const groupId = data[2].ref.id;
          return tableDocs
            .map(t => this.toTableManageModel(t, player, groupId))
            .sort((a, b) => this.sortTablesByIsDefault(a, b));
        }))));
      this.groupTablesObs$.subscribe(value => this.groupTables$.next(value));
  }

  public groupTablesObs$: Observable<TableManageModel[]>;
  public groupTables$: BehaviorSubject<TableManageModel[]> = new BehaviorSubject([]);

  public async setTableAsDefault(table: TableManageModel): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = table.id;
    console.log(payload);
    try {
      await playerDocRef.update(payload);
    } catch (e) {
      console.log(e);
    }
  }

  public async clearDefaultTable(table: TableManageModel): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = firestore.FieldValue.delete();

    try {
      await playerDocRef.update(payload);
    } catch (e) {
      console.log(e);
    }
  }

  private toTableManageModel(t: DocumentChangeAction<Table>, player: Player, groupId: string): TableManageModel {
    const tableDoc = t.payload.doc;
    const tableId = tableDoc.id;
    const tableData = tableDoc.data();
    const tableManageModel = new TableManageModel();
    tableManageModel.id = tableId;
    tableManageModel.name = tableData.name;
    tableManageModel.location = tableData.location;
    tableManageModel.isDefault = player.defaultTableIdByGroup && player.defaultTableIdByGroup[groupId] === tableId;
    tableManageModel.groupId = groupId;
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
