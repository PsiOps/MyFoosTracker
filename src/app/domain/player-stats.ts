import { DocumentReference } from '@angular/fire/firestore';

export class PlayerStats {
    public matchesWonCount = 0;
    public matchesLostCount = 0;
    public tableMatchStats: { tableRef: DocumentReference, matchesWonCount: number, matchesLostCount: number }[] = [];
    public teamMateMatchStats: { teamMateRef: DocumentReference, matchesWonCount: number, matchesLostCount: number }[] = [];
    public opponentTeamMatchStats: { opponentTeamRefs: DocumentReference[], matchesWonCount: number, matchesLostCount: number }[] = [];
}
