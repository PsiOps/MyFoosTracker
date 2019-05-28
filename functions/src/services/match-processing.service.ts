import { Match, Team } from '../domain/match';
import { StatsUpdateService } from './stats-update.service';
import { StatsIncrementService } from './stats-increment.service';

export class MatchProcessingService {

    constructor(
        private firestore: FirebaseFirestore.Firestore,
        private statsIncrementService: StatsIncrementService,
        private statsUpdateService: StatsUpdateService
    ) { }

    public async processMatch(matchPath: string): Promise<{ message: string }> {
        const match = (await this.firestore.doc(matchPath).get()).data() as Match;
        if (!match) { return { message: 'Unable to update statistics: Match not found' }; }
                
        const teamAIncrements = this.statsIncrementService.getIncrements(match, Team.teamA);
        const teamBIncrements = this.statsIncrementService.getIncrements(match, Team.teamB);

        // - For Each PlayerId
        // - Determine the team this player is in (should be TeamService method)
        // - Inside a transaction:
        // - Get the PlayerStats (if exist)
        // - Apply the increments of the right Team (use incrementService method)
        // - Apply the transaction
        await this.statsUpdateService.updatePlayerStatsForMatch(match, teamAIncrements, teamBIncrements);

        // - For Each TeamId
        // - Determine whether team is Team A or Team B (should be TeamService method)
        // - Inside a transaction:
        // - Get the TeamStats (if exist)
        // - Apply the increments of the right Team (use incrementService method)
        // - Apply the transaction
        await this.statsUpdateService.updateTeamStatsForMatch(match, teamAIncrements, teamBIncrements);

        // - For the Team Combo Id
        // - Inside a transaction:
        // - Get the TeamComboStats (if exist)
        // - Apply the increments to both Teams Stats (use incrementService method)
        // - Apply the transaction
        await this.statsUpdateService.updateTeamCombinationStatsForMatch(match, teamAIncrements, teamBIncrements);
       
        return { message: 'Succes' }
    }
}