import { Match, Team } from '../domain/match';
import { TeamStats } from '../domain/team-stats';
import { TeamService } from './team.service';

export class TeamStatsUpdateService {
    constructor(
        private firestore: FirebaseFirestore.Firestore, 
        private teamService: TeamService
        ) {}

    public async updateTeamStatsForMatch(match: Match, teamIds: string[]): Promise<void> {
        teamIds.forEach(async teamId => {
            const opponentTeamId = teamIds.find(tid => tid !== teamId);
            const teamStatsDocRef = this.firestore.doc(`team-stats/${teamId}`);
            await this.firestore.runTransaction(async transaction => {
                const doc = await transaction.get(teamStatsDocRef);
                const currentStats = doc.data() as TeamStats;
                if (!currentStats) {
                    const newStats = new TeamStats();
                    this.updateTeamStats(match, teamId, opponentTeamId, newStats);
                    transaction.set(teamStatsDocRef, Object.assign({}, newStats))
                    return;
                }
                this.updateTeamStats(match, teamId, opponentTeamId, currentStats);
                transaction.update(teamStatsDocRef, Object.assign({}, currentStats))
            });
        });
    }

    public updateTeamStats(match: Match, teamId: string, opponentTeamId: string, teamStats: TeamStats) {
        const winningTeam = match.goalsTeamA === match.goalsTeamB ? Team.none : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
        const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
        const matchDurationMinutes = Math.floor((diffMs / 1000) / 60);
        const teamTeam: Team = this.teamService.getTeamId(match.teamA) === teamId ?
            Team.teamA : Team.teamB
        const isWinner = teamTeam === winningTeam;
        const isTie = winningTeam === Team.none;
        const matchesWonIncrement = isWinner ? 1 : 0;
        const matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
        const matchesTiedIncrement = isTie ? 1 : 0;
        const goalsScoredIncrement = teamTeam === Team.teamA ? match.goalsTeamA : match.goalsTeamB;
        const goalsAgainstIncrement = teamTeam === Team.teamB ? match.goalsTeamA : match.goalsTeamB;
        this.incrementBasicStats(teamStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
            goalsScoredIncrement, goalsAgainstIncrement, matchDurationMinutes);
        this.updateCalculatedStats(teamStats);
    }

    private incrementBasicStats(teamStats: TeamStats, matchesWonInc: number, matchesLostInc: number, matchesTiedInc: number,
        teamGoalsScoredInc: number, teamGoalsAgainstInc: number, matchDurationInc: number) {
        teamStats.matchesWon = teamStats.matchesWon + matchesWonInc;
        teamStats.matchesLost = teamStats.matchesLost + matchesLostInc;
        teamStats.matchesTied = teamStats.matchesTied + matchesTiedInc;
        teamStats.goalsScored = teamStats.goalsScored + teamGoalsScoredInc;
        teamStats.goalsAgainst = teamStats.goalsAgainst + teamGoalsAgainstInc;
        teamStats.minutesPlayed = teamStats.minutesPlayed + matchDurationInc;
    }

    private updateCalculatedStats(teamStats: TeamStats): void {
        teamStats.averageMatchDuration = teamStats.minutesPlayed / (teamStats.matchesWon + teamStats.matchesLost);
    }
}