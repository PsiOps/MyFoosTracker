import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { TableSelectModel } from '../modules/tab1/components/table-select/table-select.model';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { withLatestFrom, map } from 'rxjs/operators';
import { Table } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(
    public authService: AuthenticationService,
    private afs: AngularFirestore
  ) { }

  public getTables$(): Observable<TableSelectModel[]> {
    return this.afs.collection<Table>('foosball-tables').snapshotChanges()
      .pipe(withLatestFrom(this.authService.playerDoc.valueChanges()))
      .pipe(map(data => {
        const tableDocs = data[0];
        const player = data[1];
        return tableDocs.map(t => {
          const tableDoc = t.payload.doc;
          const tableId = tableDoc.id;
          const tableData = tableDoc.data();
          const tableSelectModel = new TableSelectModel();
          tableSelectModel.id = tableId;
          tableSelectModel.name = tableData.name;
          tableSelectModel.location = tableData.location;
          tableSelectModel.isFavourite = player.favouriteTableIds && player.favouriteTableIds.some(tid => tid === tableId);
          tableSelectModel.isDefault = player.defaultTableId === tableId;
          return tableSelectModel;
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
