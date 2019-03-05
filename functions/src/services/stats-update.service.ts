import { Match, Team } from '../domain/match';
import { PlayerStats } from '../domain/player-stats';

export class StatsUpdateService {
    constructor(private firestore: FirebaseFirestore.Firestore) { }
    public async updateStatsForMatch(matchPath: string): Promise<{ message: string }> {
        const match = (await this.firestore.doc(matchPath).get()).data() as Match;
        if (!match) { return { message: 'Unable to update statistics: Match not found' }; }
        const winningTeam = match.goalsTeamA === match.goalsTeamB ? Team.none : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
        const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
        const matchDurationMinutes = Math.floor((diffMs / 1000) / 60);
        match.teamA.forEach((tm: { playerRef: { id: string } }) => this.updateStatsForPlayer(tm.playerRef.id, Team.teamA, winningTeam, matchDurationMinutes, match));
        match.teamB.forEach((tm: { playerRef: { id: string } }) => this.updateStatsForPlayer(tm.playerRef.id, Team.teamB, winningTeam, matchDurationMinutes, match));
        return { message: 'Succes' }

    }
    public updatePlayerStats(match: Match, playerId: string, playerStats: PlayerStats) {
        const winningTeam = match.goalsTeamA === match.goalsTeamB ? Team.none : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
        const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
        const matchDurationMinutes = Math.floor((diffMs / 1000) / 60);
        const playerTeam: Team = match.teamA.map(p => p.playerRef.id).indexOf(playerId) >= 0 ?
            Team.teamA : Team.teamB
        const isWinner = playerTeam === winningTeam;
        const isTie = winningTeam === Team.none;
        const isOrganizer = playerId === match.organizer;
        const matchesWonIncrement = isWinner ? 1 : 0;
        const matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
        const matchesTiedIncrement = isTie ? 1 : 0;
        const matchesOrganizedIncrement = isOrganizer ? 1 : 0;
        const teamGoalsScoredIncrement = playerTeam === Team.teamA ? match.goalsTeamA : match.goalsTeamB;
        this.incrementBasicStats(playerStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
            matchesOrganizedIncrement, teamGoalsScoredIncrement, matchDurationMinutes);
        this.updateCalculatedStats(playerStats);
    }
    private async updateStatsForPlayer(playerId: string, playerTeam: Team, winningTeam: Team, minutesPlayedIncrement: number, match: Match) {
        const docRef = this.firestore.doc(`player-stats/${playerId}`);
        const isWinner = playerTeam === winningTeam;
        const isTie = winningTeam === Team.none;
        const isOrganizer = playerId === match.organizer;
        const matchesWonIncrement = isWinner ? 1 : 0;
        const matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
        const matchesTiedIncrement = isTie ? 1 : 0;
        const matchesOrganizedIncrement = isOrganizer ? 1 : 0;
        const teamGoalsScoredIncrement = playerTeam === Team.teamA ? match.goalsTeamA : match.goalsTeamB;

        await this.firestore.runTransaction(async transaction => {
            const doc = await transaction.get(docRef);
            const currentStats = doc.data() as PlayerStats;
            if (!currentStats) {
                const newStats = new PlayerStats();
                this.incrementBasicStats(newStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
                    matchesOrganizedIncrement, teamGoalsScoredIncrement, minutesPlayedIncrement);
                this.updateCalculatedStats(newStats);
                transaction.set(docRef, Object.assign({}, newStats))
                return;
            }
            this.incrementBasicStats(currentStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
                matchesOrganizedIncrement, teamGoalsScoredIncrement, minutesPlayedIncrement);
            this.updateCalculatedStats(currentStats);
            transaction.update(docRef, Object.assign({}, currentStats))
        });
    }
    private incrementBasicStats(playerStats: PlayerStats, matchesWonInc: number, matchesLostInc: number, matchesTiedInc: number,
        matchesOrgInc: number, teamGoalsScoredInc: number, matchDurationInc: number) {
        playerStats.matchesWonCount = playerStats.matchesWonCount + matchesWonInc;
        playerStats.matchesLostCount = playerStats.matchesLostCount + matchesLostInc;
        playerStats.matchesTiedCount = playerStats.matchesTiedCount + matchesTiedInc;
        playerStats.matchesOrganizedCount = playerStats.matchesOrganizedCount + matchesOrgInc;
        playerStats.teamGoalsScoredCount = playerStats.teamGoalsScoredCount + teamGoalsScoredInc;
        playerStats.minutesPlayedCount = playerStats.minutesPlayedCount + matchDurationInc;
    }
    private updateCalculatedStats(playerStats: PlayerStats): void {
        playerStats.matchDurationMinutesAverage = playerStats.minutesPlayedCount / (playerStats.matchesWonCount + playerStats.matchesLostCount);
    }
    // const updateComplexStats = (playerStats: PlayerStats, isWinner: boolean, team: Team, match: Match): void => {
    //     const winInc = isWinner ? x
    //     const tableStat = playerStats.tableMatchStats[match.tableRef.id]  as IStat;
    //     if(tableStat) { tableStat.matchesWonCount = }
    // }

}