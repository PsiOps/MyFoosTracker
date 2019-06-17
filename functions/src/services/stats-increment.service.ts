import { Match, Team } from '../domain/match';
import { StatsIncrements } from '../models/stats-increments';
import { TeamService } from './team.service';
import { Stats } from '../domain/stats';

export class StatsIncrementService {
    constructor(private teamService: TeamService){}

    getIncrements(match: Match, team: Team): StatsIncrements {
        const increments = new StatsIncrements();
        const winningTeam = this.teamService.getWinningTeam(match);
        const isWinner = team === winningTeam
        const isTie = winningTeam === Team.none;

        increments.matchesWonIncrement = isWinner ? 1 : 0;
        increments.matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
        increments.matchesTiedIncrement = isTie ? 1 : 0;
        increments.goalsScoredIncrement = team === Team.teamA ? match.goalsTeamA : match.goalsTeamB;
        increments.goalsAgainstIncrement = team === Team.teamB ? match.goalsTeamA : match.goalsTeamB;

        const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
        increments.minutesPlayedIncrement = Math.floor((diffMs / 1000) / 60);

        return increments;
    }

    public incrementStats(stats: Stats, increments: StatsIncrements): void {
        stats.matchesWon += increments.matchesWonIncrement;
        stats.matchesLost += increments.matchesLostIncrement;
        stats.matchesTied += increments.matchesTiedIncrement;
        stats.goalsScored += increments.goalsScoredIncrement;
        stats.goalsAgainst += increments.goalsAgainstIncrement;
        stats.minutesPlayed += increments.minutesPlayedIncrement;
    }

    public combineIncrements(increments: StatsIncrements, incrementsToCombine: StatsIncrements) {
        increments.matchesWonIncrement += incrementsToCombine.matchesWonIncrement;
        increments.matchesLostIncrement += incrementsToCombine.matchesLostIncrement;
        increments.matchesTiedIncrement += incrementsToCombine.matchesTiedIncrement;
        increments.goalsScoredIncrement += incrementsToCombine.goalsScoredIncrement;
        increments.goalsAgainstIncrement += incrementsToCombine.goalsAgainstIncrement;
        increments.minutesPlayedIncrement += incrementsToCombine.minutesPlayedIncrement;
    }
}