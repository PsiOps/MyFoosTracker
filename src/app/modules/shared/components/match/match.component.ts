import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { Match, Team, Player, Table } from 'src/app/domain';
import { User } from 'firebase/app';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnChanges {
  @Input() match: Match;
  @Input() currentUser: User;
  @Input() showTable: boolean;
  @Output() scoreConfirmed = new EventEmitter();
  @Output() scoringCancelled = new EventEmitter();
  @Output() matchJoined = new EventEmitter();

  public table$: Promise<Table>;
  public teamAPlayer1: Player;
  public teamAPlayer2: Player;
  public teamBPlayer1: Player;
  public teamBPlayer2: Player;

  ngOnInit() { }
  ngOnChanges() {
    this.table$ = this.match.tableRef.get().then(s => s.data() as Table);
    if (this.match.teamA[0]) { this.match.teamA[0].playerRef.get().then(s => this.teamAPlayer1 = s.data() as Player); } else {
      this.teamAPlayer1 = null; }
    if (this.match.teamA[1]) { this.match.teamA[1].playerRef.get().then(s => this.teamAPlayer2 = s.data() as Player); } else {
      this.teamAPlayer2 = null; }
    if (this.match.teamB[0]) { this.match.teamB[0].playerRef.get().then(s => this.teamBPlayer1 = s.data() as Player); } else {
      this.teamBPlayer1 = null; }
    if (this.match.teamB[1]) { this.match.teamB[1].playerRef.get().then(s => this.teamBPlayer2 = s.data() as Player); } else {
      this.teamBPlayer2 = null; }
  }
  public confirmScore(): void {
    this.scoreConfirmed.emit({ goalsTeamA: this.match.goalsTeamA, goalsTeamB: this.match.goalsTeamB });
  }
  public cancelScoring(): void {
    this.scoringCancelled.emit();
  }
  public addTeamAPlayer(): void {
    this.matchJoined.emit(Team.teamA);
  }
  public addTeamBPlayer(): void {
    this.matchJoined.emit(Team.teamB);
  }
  public canJoin() {
    return this.match.status === 0 && this.match.participants.indexOf(this.currentUser.uid) === -1;
  }
}
