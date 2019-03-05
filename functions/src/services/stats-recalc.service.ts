import { StatsUpdateService } from './stats-update.service';
import { PlayerStats } from '../domain/player-stats';
import { Match } from '../domain/match';

export class StatsRecalcService{
    constructor(private statsUpdateService: StatsUpdateService, private firestore: FirebaseFirestore.Firestore){}

    public async recalculateStatistics(): Promise<{ message: string }> {
        const matchDocuments = await this.firestore.collection('matches').get();
        const matches = matchDocuments.docs.map(ds => ds.data()) as Match[];
        const playersRef = this.firestore.collection('players')
        const playerDocs = await playersRef.where("needsStatsRecalc", "==", true).get();
        if(playerDocs.empty) {
            console.log('Found no players to recalculate');
            return {message: 'Recalculation complete'};
        }
        else{
            console.log(`Found ${playerDocs.size} players to recalculate`);
        };
        playerDocs.forEach(playerDoc => {
            console.log(`Recalculating for player with id: ${playerDoc.id}`);
            const playerMatches = matches.filter(m => m.participants.indexOf(playerDoc.id) >= 0);
            const newStats = new PlayerStats();
            playerMatches.forEach(m => this.statsUpdateService.updatePlayerStats(m, playerDoc.id, newStats));
            const playerStatsDoc = this.firestore.doc(`player-stats/${playerDoc.id}`);
            playerStatsDoc.set(Object.assign({}, newStats))
                .then(() => {
                    playerDoc.ref.update({needsStatsRecalc: false})
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        });
        return {message: 'Recalculation complete'}
    }

    public async markForRecalculation(): Promise<{ message: string }> {
        const playerDocs = await this.firestore.collection('players').get();
        playerDocs.forEach(playerDoc => {
            playerDoc.ref.update({needsStatsRecalc: true})
                .catch(err => console.log(err));
        });
        return {message: 'All players marked for recalculation'}
    }

}