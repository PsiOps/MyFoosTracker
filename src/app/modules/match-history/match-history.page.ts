import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus, Player } from '../../domain';
import { map, switchMap, filter } from 'rxjs/operators';
import { SharedState } from 'src/app/state/shared.state';
import { GroupService } from 'src/app/services/group.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-match-history',
  templateUrl: 'match-history.page.html',
  styleUrls: ['match-history.page.scss']
})
export class MatchHistoryPage {

  public matchesPerDay: { day: Date, matches: Match[] }[] = [];

  private matchesAfterKey: Date;
  private matchesUntillKey: Date;
  private daysPerBatch = 3;

  constructor(
    private afs: AngularFirestore,
    public state: SharedState,
    public groupService: GroupService
  ) {
    this.state.currentGroupId$.subscribe(() => this.matchesPerDay = []);
    this.setInitialDates();
    this.loadMoreData();
  }

  public refresh($event: any) {
    setTimeout(() => $event.target.complete(), 500);
    this.setInitialDates();
    this.loadMoreData();
  }

  public loadData(event: any) {
    this.loadMoreData(event);
  }

  private loadMoreData(event?: any) {
    combineLatest([this.state.player$, this.state.currentGroupId$])
      .pipe(filter(([player]) => !!player && !!player.currentGroupId))
      .pipe(switchMap(([player, groupId]) => this.afs.collection<Match>('matches', ref => this.filterMatches(ref, player, groupId))
        .valueChanges()))
      .pipe(
        map(matches => this.groupMatchesByDay(matches))
      )
      .subscribe(matchesByDay => {
        this.matchesPerDay = matchesByDay;
        this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
        this.matchesUntillKey.setDate(this.matchesUntillKey.getDate() - this.daysPerBatch);

        if (event) {
          event.target.complete();
        }
      });
  }

  private filterMatches = (ref: CollectionReference, player: Player, groupId: string): Query => ref
    .where('status', '==', MatchStatus.over)
    .where('groupId', '==', groupId)
    .orderBy('dateTimeStart', 'desc')
    .startAfter(this.matchesAfterKey)
    .endAt(this.matchesUntillKey)

  private groupMatchesByDay(matches: Match[]): { day: Date, matches: Match[] }[] {
    return matches.reduce((result: any[], match: any) => {
      const dayKey = match.dateTimeStart.toDate().toISOString().substring(0, 10);
      let dayItem = result.find(i => i.day === dayKey);
      if (!dayItem) {
        dayItem = { day: dayKey, matches: [] };
        result.push(dayItem);
      }
      const matchKey = match.dateTimeStart.toDate().toISOString();
      const existingMatch = dayItem.matches.find(m => m.dateTimeStart.toDate().toISOString() === matchKey);
      if (!existingMatch) {
        dayItem.matches.push(match);
      }
      return result;
    }, this.matchesPerDay || []);
  }

  private setInitialDates() {
    this.matchesAfterKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesUntillKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() + 1); // Makes start after tomorrow
    this.matchesUntillKey.setDate(this.matchesAfterKey.getDate() - 10);
  }
}
