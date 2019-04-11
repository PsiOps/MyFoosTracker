import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable, combineLatest } from 'rxjs';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Table, Player } from '../domain';
import { TableManageModel } from '../modules/shared/models/table-manage.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  constructor(
    public authService: AuthenticationService,
    private afs: AngularFirestore
  ) { }

  public getAllTables$(): Observable<TableManageModel[]> {
    return combineLatest(this.afs.collection<Table>('foosball-tables').snapshotChanges(),
    this.authService.playerDoc.valueChanges())
    .pipe(map(data => {
      const tableDocs = data[0];
      const player = data[1];
      return tableDocs
        .filter(t => t.payload.doc.id !== 'HvPz1XQMtOGAxw0pq1dq')
        .map(t => this.toTableManageModel(t, player))
        .sort((a, b) => this.sortTablesByIsDefault(a, b));
    }));
  }

  public getPlayerTables$(): Observable<TableManageModel[]> {
    return combineLatest(this.afs.collection<Table>('foosball-tables').snapshotChanges(),
    this.authService.playerDoc.valueChanges())
    .pipe(map(data => {
      const tableDocs = data[0];
      const player = data[1];
      return tableDocs
        .filter(t => t.payload.doc.id !== 'HvPz1XQMtOGAxw0pq1dq' && player.favouriteTableIds.some(tid => tid === t.payload.doc.id))
        .map(t => this.toTableManageModel(t, player))
        .sort((a, b) => this.sortTablesByIsDefault(a, b));
    }));
  }

  private toTableManageModel(t: DocumentChangeAction<Table>, player: Player): TableManageModel {
    const tableDoc = t.payload.doc;
    const tableId = tableDoc.id;
    const tableData = tableDoc.data();
    const tableManageModel = new TableManageModel();
    tableManageModel.id = tableId;
    tableManageModel.name = tableData.name;
    tableManageModel.location = tableData.location;
    tableManageModel.isFavourite = player.favouriteTableIds && player.favouriteTableIds.some(tid => tid === tableId);
    tableManageModel.isDefault = player.defaultTableId === tableId;
    return tableManageModel;
  }

  private sortTablesByIsDefault(a: TableManageModel, b: TableManageModel): number {
    const aScore = a.isDefault ? 1 : 0;
    const bScore = b.isDefault ? 1 : 0;
    if (aScore === bScore) {
      return this.sortTablesByIsFavourite(a, b);
    }
    return bScore > aScore ? 1 : -1;
  }

  private sortTablesByIsFavourite(a: TableManageModel, b: TableManageModel): number {
    const aScore = a.isFavourite ? 1 : 0;
    const bScore = b.isFavourite ? 1 : 0;
    if (aScore === bScore) {
      return 0;
    }
    return bScore > aScore ? 1 : -1;
  }

  public async addTableToFavourites(tableId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouriteTableIds: firestore.FieldValue.arrayUnion(tableId),
      watchingTableIds: firestore.FieldValue.arrayUnion(tableId)
    };

    await playerDocRef.update(payload);
  }

  public async removeTableFromFavourites(tableId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouriteTableIds: firestore.FieldValue.arrayRemove(tableId),
      watchingTableIds: firestore.FieldValue.arrayRemove(tableId)
    };
    await playerDocRef.update(payload);
  }

  public async setTableAsDefault(tableId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      defaultTableId: tableId,
      favouriteTableIds: firestore.FieldValue.arrayUnion(tableId),
      watchingTableIds: firestore.FieldValue.arrayUnion(tableId)
    };

    await playerDocRef.update(payload);
  }

  public async clearDefaultTable(): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      defaultTableId: firestore.FieldValue.delete()
    };

    await playerDocRef.update(payload);
  }
}
