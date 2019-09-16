import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus, Player } from '../../domain';
import { map, switchMap, filter } from 'rxjs/operators';
import { SharedState } from 'src/app/state/shared.state';
import { GroupService } from 'src/app/services/group.service';

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
  private minNumberOfMatchesToLoad = 8;
  private daysPerBatch = 3;

  constructor(
    private afs: AngularFirestore,
    public state: SharedState,
    public groupService: GroupService
  ) {
    this.setInitialDates();
    this.loadMoreData();
  }

  public loadData(event: any) {
    this.loadMoreData(event);
  }

  private loadMoreData(event?: any) {
    this.state.player$
      .pipe(filter(player => !!player && !!player.currentGroupId))
      .pipe(switchMap(player => this.afs.collection<Match>('matches', ref => this.filterMatches(ref, player))
        .valueChanges()))
      .pipe(
        map(this.groupMatchesByDay)
      )
      .subscribe(matchesByDay => {
        this.matchesPerDay = this.matchesPerDay.concat(matchesByDay);
        this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
        this.matchesUntillKey.setDate(this.matchesUntillKey.getDate() - this.daysPerBatch);

        if (event) {
          event.target.complete();
        } else if (this.matchesPerDay.length < this.minNumberOfMatchesToLoad) {
          this.loadMoreData();
        }
      });
  }

  private filterMatches = (ref: CollectionReference, player: Player): Query => ref
    .where('status', '==', MatchStatus.over)
    .where('groupId', '==', player.currentGroupId)
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
    this.matchesAfterKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesUntillKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() + 1); // Makes start after tomorrow
    this.matchesUntillKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
  }
}
