import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(
    public authService: AuthenticationService
  ) { }

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
}
