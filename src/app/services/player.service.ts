import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';
import { PlayerSelectModel } from '../modules/home/models/player-select.model';
import { Player, Group } from '../domain';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { TableManageModel } from '../modules/shared/models/table-manage.model';
import { SharedState } from '../state/shared.state';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public playerGroups$: BehaviorSubject<Group[]> = new BehaviorSubject([]);

  private playerDoc: AngularFirestoreDocument<Player>;
  public playerDocRef: firebase.firestore.DocumentReference;

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private state: SharedState,
    private authService: AuthenticationService
  ) {

    this.authService.user$
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.playerDoc = this.afs.doc<Player>(`players/${user.uid}`);
        this.playerDocRef = this.playerDoc.ref;

        const playerObs$ = this.playerDoc.valueChanges()
          .pipe(filter(player => !!player))
          .pipe(map(player => {
            player.id = user.uid;
            if (player.defaultTableIdByGroup && player.defaultGroupId) {
              player.currentGroupDefaultTableId = player.defaultTableIdByGroup[player.defaultGroupId];
            }
            return player;
          }));

        playerObs$.subscribe(player => this.state.player$.next(player));

        const now = new Date();
        this.playerDoc.update({ lastLogin: now }).catch(async (error) => {
          // Error means player does not exist yet, so we create a new one:
          const player = new Player();
          player.photoUrl = user.photoURL;
          player.playerSince = now;
          player.lastLogin = now;
          player.favouritePlayerIds = [];
          await this.playerDoc.set(Object.assign({}, player));
          await this.router.navigateByUrl('/welcome');
        });
      });


    const playerGroupsObs$ = this.state.player$
      .pipe(filter(player => !!player))
      .pipe(map(player => player.groupIds))
      .pipe(switchMap(groupIds => {
        return combineLatest(groupIds.map(groupId => {
          return this.afs.doc<Group>(`groups/${groupId}`).valueChanges()
            .pipe(map(group => {
              group.id = groupId;
              return group;
            }));
        }));
      }));
    playerGroupsObs$.subscribe(groups => this.playerGroups$.next(groups));
  }

  public async setNickname(nickname: string): Promise<void> {
    if (!this.playerDoc) { return; }
    await this.playerDoc.update({ nickname: nickname });
  }

  public isCurrentUser(playerId: string): boolean {
    return this.playerDocRef.id === playerId;
  }

  public async addPlayerToFavourites(playerId: string): Promise<void> {

    const payload: firebase.firestore.UpdateData = {
      favouritePlayerIds: firebase.firestore.FieldValue.arrayUnion(playerId),
    };

    await this.playerDocRef.update(payload);
  }

  public async removePlayerFromFavourites(playerId: string): Promise<void> {
    const payload: firebase.firestore.UpdateData = {
      favouritePlayerIds: firebase.firestore.FieldValue.arrayRemove(playerId),
    };

    await this.playerDocRef.update(payload);
  }

  public getFavourites(): Observable<string[]> {
    return this.state.player$
      .pipe(map(player => {
        if (!player) { return []; }
        return player.favouritePlayerIds;
      }));
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

    const payload: firebase.firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = table.id;
    console.log(payload);
    try {
      await this.playerDocRef.update(payload);
    } catch (e) {
      console.log(e);
    }
  }

  public async clearDefaultTable(table: TableManageModel): Promise<void> {

    const payload: firebase.firestore.UpdateData = {};
    payload[`defaultTableIdByGroup.${table.groupId}`] = firebase.firestore.FieldValue.delete();

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
