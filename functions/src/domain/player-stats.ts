import * as admin from 'firebase-admin';
export class PlayerStats {
    public matchesWonCount = 0;
    public matchesLostCount = 0;
    public matchesTiedCount = 0;
    public matchesOrganizedCount = 0;
    public minutesPlayedCount = 0;
    public matchDurationMinutesAverage = 0;
    public teamGoalsScoredCount = 0;
    public tableMatchStats: { tableRef: admin.firestore.DocumentReference, matchesWonCount: number, matchesLostCount: number }[] = [];
    public teamMateMatchStats: { teamMateRef: admin.firestore.DocumentReference, matchesWonCount: number, matchesLostCount: number }[] = [];
    public opponentTeamMatchStats: { opponentTeamRefs: admin.firestore.DocumentReference[], matchesWonCount: number, matchesLostCount: number }[] = [];
}
