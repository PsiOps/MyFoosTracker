import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { Match, MatchPosition } from 'src/app/domain/match';
import { Player } from 'src/app/domain/player';
import { User } from 'firebase';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnChanges {
  @Input() match: Match;
  @Input() currentUser: User;
  @Output() scoreConfirmed = new EventEmitter();
  @Output() scoringCancelled = new EventEmitter();
  @Output() matchJoined = new EventEmitter();

  public teamAPlayer1: Player;
  public teamAPlayer2: Player;
  public teamBPlayer1: Player;
  public teamBPlayer2: Player;

  ngOnInit() { }
  ngOnChanges() {
    if (this.match.teamAPlayer1) { this.match.teamAPlayer1.playerRef.get().then(s => this.teamAPlayer1 = s.data() as Player); }
    if (this.match.teamAPlayer2) { this.match.teamAPlayer2.playerRef.get().then(s => this.teamAPlayer2 = s.data() as Player); }
    if (this.match.teamBPlayer1) { this.match.teamBPlayer1.playerRef.get().then(s => this.teamBPlayer1 = s.data() as Player); }
    if (this.match.teamBPlayer2) { this.match.teamBPlayer2.playerRef.get().then(s => this.teamBPlayer2 = s.data() as Player); }
  }
  public confirmScore(): void {
    this.scoreConfirmed.emit({ goalsTeamA: this.match.goalsTeamA, goalsTeamB: this.match.goalsTeamB });
  }
  public cancelScoring(): void {
    this.scoringCancelled.emit();
  }
  public addTeamAPlayer1(): void {
    this.matchJoined.emit({position: MatchPosition.teamAPlayer1});
  }
  public addTeamAPlayer2(): void {
    this.matchJoined.emit({position: MatchPosition.teamAPlayer2});
  }
  public addTeamBPlayer1(): void {
    this.matchJoined.emit({position: MatchPosition.teamBPlayer1});
  }
  public addTeamBPlayer2(): void {
    this.matchJoined.emit({position: MatchPosition.teamBPlayer2});
  }
  public canJoin() {
    return this.match.status === 0 && this.match.participants.indexOf(this.currentUser.uid) === -1;
  }
}
