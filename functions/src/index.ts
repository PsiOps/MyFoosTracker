import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Match, Team } from './domain/match';
import { PlayerStats } from './domain/player-stats';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();

const incrementBasicStats = (playerStats: PlayerStats, matchesWonInc: number, matchesLostInc: number, matchesTiedInc: number,
        matchesOrgInc: number, teamGoalsScoredInc: number, matchDurationInc: number) => {
    playerStats.matchesWonCount = playerStats.matchesWonCount + matchesWonInc;
    playerStats.matchesLostCount = playerStats.matchesLostCount + matchesLostInc;
    playerStats.matchesTiedCount = playerStats.matchesTiedCount + matchesTiedInc;
    playerStats.matchesOrganizedCount = playerStats.matchesOrganizedCount + matchesOrgInc;
    playerStats.teamGoalsScoredCount = playerStats.teamGoalsScoredCount + teamGoalsScoredInc;
    playerStats.minutesPlayedCount = playerStats.minutesPlayedCount + matchDurationInc;
}
const updateCalculatedStats = (playerStats: PlayerStats): void => {
    playerStats.matchDurationMinutesAverage = playerStats.minutesPlayedCount / (playerStats.matchesWonCount + playerStats.matchesLostCount);
}
// const updateComplexStats = (playerStats: PlayerStats, isWinner: boolean, team: Team, match: Match): void => {
//     const winInc = isWinner ? x
//     const tableStat = playerStats.tableMatchStats[match.tableRef.id]  as IStat;
//     if(tableStat) { tableStat.matchesWonCount = }
// }
const updateStatsForPlayer = async (playerId: string, playerTeam: Team, winningTeam: Team, minutesPlayedIncrement: number, match: Match) => {
    const docRef = firestore.doc(`player-stats/${playerId}`);
    const isWinner = playerTeam === winningTeam;
    const isTie = winningTeam === Team.none;
    const isOrganizer = playerId === match.organizer;
    const matchesWonIncrement = isWinner ? 1 : 0;
    const matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
    const matchesTiedIncrement = isTie ? 1 : 0;
    const matchesOrganizedIncrement = isOrganizer ? 1 : 0;
    const teamGoalsScoredIncrement = playerTeam === Team.teamA ? match.goalsTeamA : match.goalsTeamB;
    
    await firestore.runTransaction(async transaction => {
        const doc = await transaction.get(docRef);
        const currentStats = doc.data() as PlayerStats;
        if (!currentStats) {
            const newStats = new PlayerStats();
            incrementBasicStats(newStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
                matchesOrganizedIncrement, teamGoalsScoredIncrement, minutesPlayedIncrement);
            updateCalculatedStats(newStats);
            transaction.set(docRef, Object.assign({}, newStats))
            return;
        }
        incrementBasicStats(currentStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
            matchesOrganizedIncrement, teamGoalsScoredIncrement, minutesPlayedIncrement);
        updateCalculatedStats(currentStats);
        transaction.update(docRef, Object.assign({}, currentStats))
    });
}

export const updatePlayerStats = functions.https.onCall(async (data, context) => {    
    const match = (await firestore.doc(data.matchPath).get()).data() as Match;
    if(!match) { return { message: 'Unable to update statistics: Match not found'}; }
    const winningTeam = match.goalsTeamA === match.goalsTeamB ? Team.none : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
    const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
    const matchDurationMinutes = Math.floor((diffMs/1000)/60);
    match.teamA.forEach((tm: {playerRef: {id: string}}) => updateStatsForPlayer(tm.playerRef.id, Team.teamA, winningTeam, matchDurationMinutes, match));
    match.teamB.forEach((tm: {playerRef: {id: string}}) => updateStatsForPlayer(tm.playerRef.id, Team.teamB, winningTeam, matchDurationMinutes, match));
    return { message: 'Succes' }
});
