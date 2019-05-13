import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerSelectModel } from '../modules/tab1/models/player-select.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(
    public authService: AuthenticationService
  ) { }

  public isCurrentUser(playerId: string): boolean {
    const playerDocRef = this.authService.playerDoc.ref;

    return playerDocRef.id === playerId;
  }

  public async addPlayerToFavourites(playerId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouritePlayerIds: firestore.FieldValue.arrayUnion(playerId),
    };

    await playerDocRef.update(payload);
  }

  public async removePlayerFromFavourites(playerId: string): Promise<void> {
    const playerDocRef = this.authService.playerDoc.ref;

    const payload: firestore.UpdateData = {
      favouritePlayerIds: firestore.FieldValue.arrayRemove(playerId),
    };

    await playerDocRef.update(payload);
  }

  public getFavourites(): Observable<string[]> {
    return this.authService.playerDoc.valueChanges().pipe(
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

}
