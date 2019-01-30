import { DocumentReference } from '@angular/fire/firestore';
import { Player } from './player';

export enum Teams {
    A, B
}
export enum MatchStatus {
    open, started, over
}
export class Match {
    pin: number;
    status: MatchStatus;
    goalsTeamA: number;
    goalsTeamB: number;
    participants: number[];
    teamA: DocumentReference[];
    teamB: DocumentReference[];
    teamAPlayers: Player[];
    teamBPlayers: Player[];
}
