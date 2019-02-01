import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Match, MatchStatus } from '../domain/match';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/authentication.service';
import { map } from 'rxjs/operators';
import { Player } from '../domain/player';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public playerMatches: AngularFirestoreCollection<Match>;
  public playerMatches$: Observable<Match[]>;
  constructor(private afs: AngularFirestore, private authService: AuthenticationService) {
    this.playerMatches = afs.collection<Match>('matches',
      ref => ref.where('status', '==', MatchStatus.over)
        .where('participants', 'array-contains', this.authService.user.uid)
    );
    this.playerMatches$ = this.playerMatches.valueChanges().pipe(map(matches => matches.map(m => {
      // m.teamAPlayers = [];
      // m.teamBPlayers = [];
      // m.teamA.map(tm => tm.playerRef.get().then(ds => m.teamAPlayers.push(ds.data() as Player)));
      // m.teamB.map(tm => tm.playerRef.get().then(ds => m.teamBPlayers.push(ds.data() as Player)));
      return m;
    })));
  }
}
