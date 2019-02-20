import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Player } from '../../../domain/player';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {
  public players: AngularFirestoreCollection<Player>;
  public players$: Observable<Player[]>;

  constructor(private authService: AuthenticationService,
    private afs: AngularFirestore) { }
  ngOnInit() {
    this.players = this.afs.collection<Player>('players', ref => ref.limit(4));
    this.players$ = this.players.valueChanges();
  }
}
