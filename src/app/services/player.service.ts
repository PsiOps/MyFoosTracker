import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, filter, skip } from 'rxjs/operators';
import { PlayerSelectModel } from '../modules/home/models/player-select.model';
import { Player, Group, Table } from '../domain';
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { TableManageModel } from '../modules/shared/models/table-manage.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public player$: BehaviorSubject<Player> = new BehaviorSubject(null);
  private playerObs$: Observable<Player>;

  private playerDoc: AngularFirestoreDocument<Player>;
  public playerDocRef: firestore.DocumentReference;

  public currentGroup$: BehaviorSubject<Group> = new BehaviorSubject(null);
  private currentGroupDoc: AngularFirestoreDocument<Group>;

  public currentGroupMembers$: BehaviorSubject<Player[]> = new BehaviorSubject([]);

  public currentGroupTables$: BehaviorSubject<Table[]> = new BehaviorSubject([]);
  private currentGroupTablesCollection: AngularFirestoreCollection<Table>;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private afs: AngularFirestore,
  ) {

    this.authService.user$
      .pipe(skip(1))
      .subscribe(user => {
        if (!user) {
          console.log('no user');
          return;
        }
        this.playerDoc = this.afs.doc<Player>(`players/${user.uid}`);
        this.playerDocRef = this.playerDoc.ref;
        this.playerObs$ = this.playerDoc.valueChanges()
          .pipe(map(player => {

            player.id = user.uid;
            player.currentGroupId = player.defaultGroupId;
            if (player.defaultTableIdByGroup) {
              const currentGroupDefaultTableId = player.defaultTableIdByGroup[player.currentGroupId];
              if (currentGroupDefaultTableId) {
                player.currentGroupDefaultTableId = currentGroupDefaultTableId;
              }
            }

            this.currentGroupDoc = this.afs.doc<Group>(`groups/${player.currentGroupId}`);
            const currentGroupObs$ = this.currentGroupDoc.valueChanges()
              .pipe(map(group => {
                group.id = this.currentGroupDoc.ref.id;
                return group;
              }));
            currentGroupObs$.subscribe(group => this.currentGroup$.next(group));

            return player;
          }));
        this.playerObs$.subscribe(player => this.player$.next(player));

        const now = new Date();
        this.playerDoc.update({ lastLogin: now }).catch((error) => {
          this.router.navigateByUrl('/welcome');
          // Error means player does not exist yet, so we create a new one:
          const player = new Player();
          player.photoUrl = user.photoURL;
          player.playerSince = now;
          player.lastLogin = now;
          player.favouritePlayerIds = [];
          this.playerDoc.set(Object.assign({}, player));
        });
      });

    const currentGroupMembersObs$ = this.currentGroup$
      .pipe(filter(group => group !== null))
      .pipe(switchMap(group =>
        this.afs.collection<Player>('players',
          ref => ref.where('groupIds', 'array-contains', group.id)).snapshotChanges()
          .pipe(map(docs => docs.map(doc => {
            const player = doc.payload.doc.data();
            player.id = doc.payload.doc.ref.id;
            return player;
          })))
      ));

    currentGroupMembersObs$.subscribe(players => this.currentGroupMembers$.next(players));

    const currentGroupTablesObs$ = this.currentGroup$
      .pipe(filter(group => group !== null))
      .pipe(map(group => this.currentGroupTablesCollection = this.currentGroupDoc.collection<Table>('tables')))
      .pipe(switchMap(collection => collection.snapshotChanges()
        .pipe(map(docs => docs.map(doc => {
          const table = doc.payload.doc.data();
          table.id = doc.payload.doc.ref.id;
          return table;
        })))));
    currentGroupTablesObs$.subscribe(tables => this.currentGroupTables$.next(tables));
  }

  public async setNickname(nickname: string): Promise<void> {
    if (!this.playerDoc) { return; }
    await this.playerDoc.update({ nickname: nickname });
  }

  public isCurrentUser(playerId: string): boolean {
    return this.playerDocRef.id === playerId;
  }

  public async addPlayerToFavourites(playerId: string): Promise<void> {

    const payload: firestore.UpdateData = {
      favouritePlayerIds: firestore.FieldValue.arrayUnion(playerId),
    };

    await this.playerDocRef.update(payload);
  }

  public async removePlayerFromFavourites(playerId: string): Promise<void> {
    const payload: firestore.UpdateData = {
      favouritePlayerIds: firestore.FieldValue.arrayRemove(playerId),
    };

    await this.playerDocRef.update(payload);
  }

  public getFavourites(): Observable<string[]> {
    return this.player$.pipe(
      map(player => player.favouritePlayerIds)
    );
  }

  public sortPlayers(a: PlayerSelectModel, b: PlayerSelectModel): number {
    const aScore = (a.isOrganizer ? 1 : 0) + (a.isSelected ? 1 : 0) + (a.isFavourite ? 1 : 0);
    const bScore = (b.isOrganizer ? 1 : 0) + (b.isSelected ? 1 : 0) + (b.isFavourite ? 1 : 0);

    if (aScore < bScore) { return 1; }
    if (aScore > bScore) { return -1; }
    if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) { return -1; }
    if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) { return 1; }

    return 0;
  }

  public async setTableAsDefault(table: TableManageModel): Promise<void> {

    const payload: firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = table.id;
    console.log(payload);
    try {
      await this.playerDocRef.update(payload);
    } catch (e) {
      console.log(e);
    }
  }

  public async clearDefaultTable(table: TableManageModel): Promise<void> {

    const payload: firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = firestore.FieldValue.delete();

    try {
      await this.playerDocRef.update(payload);
    } catch (e) {
      console.log(e);
    }
  }

  // Refactor to not need the current tokens from the Player, see how we do it for Table defaults per group
  public saveToken(player: Player, token: string): void {
    const currentTokens = player.fcmTokens || {};
    // If token does not exist in firestore, update db
    if (!currentTokens[token]) {
      const tokens = { ...currentTokens, [token]: true };
      this.playerDoc.update({ fcmTokens: tokens });
    }
  }
}
