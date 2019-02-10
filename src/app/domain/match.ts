import { DocumentReference } from '@angular/fire/firestore';

export enum MatchStatus {
    open, started, scoring, over
}
export enum Team {
    teamA, teamB
}
export class Match {
    pin: number = Math.floor(Math.random() * 10000);
    status: MatchStatus = MatchStatus.open;
    tableRef: DocumentReference;
    goalsTeamA = 0;
    goalsTeamB = 0;
    organizer: string;
    participants: string[] = [];
    dateTimeStart: Date;
    dateTimeEnd: Date;
    teamA: {playerRef: DocumentReference, goals: number}[] = [];
    teamB: {playerRef: DocumentReference, goals: number}[] = [];
}
