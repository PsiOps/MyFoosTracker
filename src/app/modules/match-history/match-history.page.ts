import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus } from '../../domain';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../../auth/authentication.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-match-history',
  templateUrl: 'match-history.page.html',
  styleUrls: ['match-history.page.scss']
})
export class MatchHistoryPage {

  public matchesCollection: AngularFirestoreCollection<Match>;

  public matchesPerDay: { day: Date, matches: Match[] }[] = [];
  // public matchesPerDay$: Observable<{ day: Date, matches: Match[] }[]>;

  constructor(private afs: AngularFirestore, private authService: AuthenticationService) {
    this.getMoreMatches();
  }

  public loadData(event: any) {
    console.log('loading data');
    this.getMoreMatches(event);
  }
  public getMoreMatches(event?: any) {
    this.afs.collection<Match>('matches', ref => this.showAllFinished(ref))
      .valueChanges()
      .pipe(map(this.groupMatchesByDay))
      .subscribe(matchesByDay => {
        console.log('subscription makes good');
        this.matchesPerDay = this.matchesPerDay.concat(matchesByDay);
        if (event) { event.target.complete(); }
      });
  }
  public refresh($event: any) {
    // this.updateMatches(this.showAllValue);
    setTimeout(() => $event.target.complete(), 500);
  }
  private updateMatches(showAll: boolean) {
    this.matchesCollection = showAll ?
      this.afs.collection<Match>('matches', ref => this.showAllFinished(ref)) :
      this.afs.collection<Match>('matches', ref => this.showFinishedForPlayer(ref));
    // this.matchesPerDay$ = this.matchesCollection
    //   .valueChanges()
    //   .pipe(map(this.groupMatchesByDay));
  }
  private groupMatchesByDay(matches: Match[]): { day: Date, matches: Match[] }[] {
    return matches.reduce((result: any[], match: any) => {
      const key = match.dateTimeStart.toDate().toISOString().substring(0, 10);
      let resultItem = result.find(i => i.day === key);
      if (!resultItem) {
        resultItem = { day: key, matches: [] };
        result.push(resultItem);
      }
      resultItem.matches.push(match);
      return result;
    }, []);
  }
  private showAllFinished = (ref: CollectionReference): Query => ref
    .where('status', '==', MatchStatus.over)
    .orderBy('dateTimeStart', 'desc')
    .limit(10)
  private showFinishedForPlayer = (ref: CollectionReference): Query => ref
    .where('status', '==', MatchStatus.over)
    .where('participants', 'array-contains', this.authService.user.uid)
    .orderBy('dateTimeStart', 'desc')
    .limit(10)
}
