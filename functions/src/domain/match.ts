import * as admin from 'firebase-admin';
export enum MatchStatus {
    open, started, scoring, over
}
export enum Team {
    teamA, teamB, none
}
export class Match {
    status: MatchStatus = MatchStatus.open;
    tableRef: admin.firestore.DocumentReference;
    goalsTeamA = 0;
    goalsTeamB = 0;
    organizer: string;
    participants: string[] = [];
    dateTimeStart: Date;
    dateTimeEnd: Date;
    teamA: {playerRef: admin.firestore.DocumentReference, goals: number}[] = [];
    teamB: {playerRef: admin.firestore.DocumentReference, goals: number}[] = [];
}
