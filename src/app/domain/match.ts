import { DocumentReference } from '@angular/fire/firestore';
import { Player } from './player';

export enum Teams {
    A, B
}
export enum MatchStatus {
    open, started, over
}
export class Match {
    pin: number = Math.floor(Math.random() * 10000);
    status: MatchStatus = MatchStatus.open;
    goalsTeamA = 0;
    goalsTeamB = 0;
    participants: string[] = [];
    dateTimeStart: Date;
    dateTimeEnd: Date;
    teamAPlayer1: {playerRef: DocumentReference, goals: number};
    teamAPlayer2: {playerRef: DocumentReference, goals: number};
    teamBPlayer1: {playerRef: DocumentReference, goals: number};
    teamBPlayer2: {playerRef: DocumentReference, goals: number};
}
