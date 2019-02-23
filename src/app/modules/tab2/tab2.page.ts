import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus } from '../../domain';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../../auth/authentication.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public matches: AngularFirestoreCollection<Match>;
  public matchesPerDay$: Observable<{ day: Date, matches: Match[] }[]>;
  private showAllValue = false;
  public get showAll() {
    return this.showAllValue;
  }
  public set showAll(val: boolean) {
    this.showAllValue = val;
    this.updateMatches(val);
  }
  constructor(private afs: AngularFirestore, private authService: AuthenticationService) {
    this.updateMatches(this.showAllValue);
  }
  public refresh($event: any) {
    this.updateMatches(this.showAllValue);
    setTimeout(() => $event.target.complete(), 500);
  }
  private updateMatches(showAll: boolean) {
    this.matches = showAll ?
      this.afs.collection<Match>('matches', ref => this.showAllFinished(ref)) :
      this.afs.collection<Match>('matches', ref => this.showFinishedForPlayer(ref));
    this.matchesPerDay$ = this.matches
      .valueChanges()
      .pipe(map(this.groupMatchesByDay));
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
