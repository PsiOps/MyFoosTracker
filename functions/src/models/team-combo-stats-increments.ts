import { StatsIncrements } from './stats-increments';

export class TeamComboStatsIncrements {
    constructor(public teamIds: string[]) {
        teamIds.forEach(teamId => {
            this.incrementsByTeamId[teamId] = new StatsIncrements();
        })
     }

     public incrementsByTeamId: Map<string, StatsIncrements>
}