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
  public playerMatchesPerDay$: Observable<{day: Date, matches: Match[]}[]>;
  constructor(private afs: AngularFirestore, private authService: AuthenticationService) {
    this.playerMatches = afs.collection<Match>('matches',
      ref => ref.where('status', '==', MatchStatus.over)
        .where('participants', 'array-contains', this.authService.user.uid)
        .orderBy('dateTimeStart', 'desc').limit(10)
    );
    this.playerMatchesPerDay$ = this.playerMatches.valueChanges().pipe(map(matches => {
      return matches.reduce((result: any[], match: any) => {
        console.log(result, match);
        const key = match.dateTimeStart.toDate().toISOString().substring(0, 10);
        console.log(key);
        let resultItem = result.find(i => i.day === key);
        if (!resultItem) {
          resultItem = {day: key, matches: [] };
          result.push(resultItem);
        }
        resultItem.matches.push(match);
        return result;
      }, []);
    }));
  }
}
