import { StatsIncrements } from './stats-increments';

export class TeamComboStatsIncrements {
    constructor(public teamIds: string[], public memberIds: string[]) {
        this.incrementsByTeamId = new Map<string, StatsIncrements>();
        teamIds.forEach(teamId => {
            this.incrementsByTeamId.set(teamId, new StatsIncrements());
        })
     }

     public incrementsByTeamId: Map<string, StatsIncrements>
}