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

        await this.statsUpdateService.updatePlayerStatsForMatch(match, teamAIncrements, teamBIncrements);
        await this.statsUpdateService.updateTeamStatsForMatch(match, teamAIncrements, teamBIncrements);
        await this.statsUpdateService.updateTeamComboStatsForMatch(match, teamAIncrements, teamBIncrements);
       
        return { message: 'Succes' }
    }
}