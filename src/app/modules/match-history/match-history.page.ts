import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { Match, MatchStatus } from '../../domain';
import { map } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-match-history',
  templateUrl: 'match-history.page.html',
  styleUrls: ['match-history.page.scss']
})
export class MatchHistoryPage implements OnInit {

  public matchesCollection: AngularFirestoreCollection<Match>;
  public matchesPerDay: { day: Date, matches: Match[] }[] = [];

  private loadingIndicator: HTMLIonLoadingElement;
  private matchesAfterKey: Date;
  private matchesUntillKey: Date;
  private minNumberOfMatchesToLoad = 8;
  private daysPerBatch = 3;

  constructor(
    private afs: AngularFirestore,
    private loadingController: LoadingController
  ) {
    this.setInitialDates();
    this.loadMoreData();
  }

  async ngOnInit() {
    this.loadingIndicator = await this.loadingController.create({
      spinner: 'dots',
      message: 'Loading...',
      backdropDismiss: true
    });

    await this.loadingIndicator.present();
  }

  public loadData(event: any) {
    this.loadMoreData(event);
  }

  public refresh($event: any) {
    setTimeout(() => {
      this.setInitialDates();
      this.matchesPerDay = [];
      this.loadMoreData($event);
    }, 500);
  }

  private loadMoreData(event?: any) {
    this.afs.collection<Match>('matches', ref => this.filterFinishedMatches(ref))
      .valueChanges()
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

        setTimeout(async () => {
          await this.loadingController.dismiss();
        }, 500);

      });
  }

  private filterFinishedMatches = (ref: CollectionReference): Query => ref
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
    this.matchesAfterKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesUntillKey = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.matchesAfterKey.setDate(this.matchesAfterKey.getDate() + 1); // Makes start after tomorrow
    this.matchesUntillKey.setDate(this.matchesAfterKey.getDate() - this.daysPerBatch);
  }
}
