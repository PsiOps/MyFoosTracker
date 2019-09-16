import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Stats } from '../../../../domain';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, OnChanges {
  public playerStatsDoc: AngularFirestoreDocument<Stats>;
  public playerStats$: Observable<Stats>;

  @Input() player: { id: string, nickname: string, photoUrl: string };
  @Input() isModal: boolean;

  constructor(
    private afs: AngularFirestore,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
    this.getStats();
  }

  ngOnChanges(): void {
    this.getStats();
  }

  public refresh($event: any) {
    setTimeout(() => $event.target.complete(), 500);
  }

  public dismiss() {
    this.modalController.dismiss();
  }

  private getStats(): void {
    if (!this.player) {
      return;
    }

    this.playerStatsDoc = this.afs.doc(`player-stats-v2/${this.player.id}`);
    this.playerStats$ = this.playerStatsDoc.valueChanges();
  }
}
