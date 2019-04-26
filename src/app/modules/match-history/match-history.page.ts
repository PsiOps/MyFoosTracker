import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus } from '../../domain';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-match-history',
  templateUrl: 'match-history.page.html',
  styleUrls: ['match-history.page.scss']
})
export class MatchHistoryPage {

  public matchesCollection: AngularFirestoreCollection<Match>;
  public matchesPerDay: { day: Date, matches: Match[] }[] = [];
  private matchesAfterKey: Date;
  private matchesUntillKey: Date;
  private daysPerBatch = 3;

  constructor(private afs: AngularFirestore) {
    this.setInitialDates();
    this.getMoreMatches();
  }

  public loadData(event: any) {
    this.getMoreMatches(event);
  }
  public refresh($event: any) {
    setTimeout(() => {
      this.setInitialDates();
      this.matchesPerDay = [];
      this.getMoreMatches($event);
    }, 500);
  }
  private getMoreMatches(event?: any) {
    this.afs.collection<Match>('matches', ref => this.showAllFinished(ref))
      .valueChanges()
      .pipe(map(this.groupMatchesByDay))
      .subscribe(matchesByDay => {
        this.matchesPerDay = this.matchesPerDay.concat(matchesByDay);
        this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
        this.matchesUntillKey.setDate(this.matchesUntillKey.getDate() - this.daysPerBatch);
        if (event) { event.target.complete(); }
      });
  }
  private showAllFinished = (ref: CollectionReference): Query => ref
    .where('status', '==', MatchStatus.over)
    .orderBy('dateTimeStart', 'desc')
    .startAfter(this.matchesAfterKey)
    .endAt(this.matchesUntillKey)

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
  private setInitialDates() {
    this.matchesAfterKey = new Date(new Date().getFullYear(), new Date().getMonth() , new Date().getDate());
    this.matchesUntillKey = new Date(new Date().getFullYear(), new Date().getMonth() , new Date().getDate());
    this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() + 1); // Makes start after tomorrow
    this.matchesUntillKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
  }
}
