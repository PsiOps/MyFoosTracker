import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { withLatestFrom, map } from 'rxjs/operators';
import { Table } from '../domain';
import { TableManageModel } from '../modules/shared/models/table-manage.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(
    public authService: AuthenticationService,
    private afs: AngularFirestore
  ) { }

  public getTables$(): Observable<TableManageModel[]> {
    return this.afs.collection<Table>('foosball-tables').snapshotChanges()
      .pipe(withLatestFrom(this.authService.playerDoc.valueChanges()))
      .pipe(map(data => {
        const tableDocs = data[0];
        const player = data[1];
        return tableDocs.map(t => {
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
        });
      }));
  }

  public async addTableToFavourites(tableId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouriteTableIds: firestore.FieldValue.arrayUnion(tableId),
      watchingTableIds: firestore.FieldValue.arrayUnion(tableId),
    };

    await playerDocRef.update(payload);
  }

  public async removeTableFromFavourites(tableId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouriteTableIds: firestore.FieldValue.arrayRemove(tableId),
      watchingTableIds: firestore.FieldValue.arrayRemove(tableId),
    };
    await playerDocRef.update(payload);
  }
}
