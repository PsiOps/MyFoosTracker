import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { Group, Player } from '../domain';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  public currentGroup$: Observable<Group>;
  public currentGroupMembers$: Observable<Player[]>;

  constructor(private authService: AuthenticationService,
    private afs: AngularFirestore) {
    this.currentGroup$ = this.authService.playerDoc.valueChanges()
      .pipe(switchMap(p => {
        return this.afs.doc<Group>(`groups/${p.defaultGroupId}`).valueChanges();
      }));
    this.currentGroupMembers$ = this.authService.playerDoc.valueChanges()
      .pipe(switchMap(p => {
        return this.afs.collection<Player>('players',
          ref => ref.where('groupIds', 'array-contains', p.defaultGroupId)).valueChanges();
      }));
  }
}
