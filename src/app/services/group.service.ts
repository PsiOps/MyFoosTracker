import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { Group, Player, Table } from '../domain';
import { Observable } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
// Convert to setup with one private observable, subscribed to by one observer, which triggers BehaviourSubject next
export class GroupService {

  public currentGroupDocument$: Observable<AngularFirestoreDocument<Group>>;
  public currentGroup$: Observable<Group>;
  public currentGroupMembers$: Observable<Player[]>;
  public currentGroupTablesCollection$: Observable<AngularFirestoreCollection<Table>>;

  constructor(private authService: AuthenticationService,
    private afs: AngularFirestore) {
    this.currentGroupDocument$ = this.authService.playerDoc.valueChanges()
      .pipe(map(p => this.afs.doc<Group>(`groups/${p.defaultGroupId}`)));

    this.currentGroup$ = this.authService.playerDoc.valueChanges()
      .pipe(map(p => this.afs.doc<Group>(`groups/${p.defaultGroupId}`)))
      .pipe(switchMap(doc => doc.valueChanges()));

    this.currentGroupMembers$ = this.authService.playerDoc.valueChanges()
      .pipe(switchMap(p => {
        return this.afs.collection<Player>('players',
          ref => ref.where('groupIds', 'array-contains', p.defaultGroupId)).valueChanges();
      }));
    this.currentGroupTablesCollection$ = this.authService.playerDoc.valueChanges()
      .pipe(map(p => this.afs.doc<Group>(`groups/${p.defaultGroupId}`)))
      .pipe(map(doc => doc.collection<Table>('tables')));
  }
}
