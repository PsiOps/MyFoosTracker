import { Match } from '../domain/match';

export class MatchService {
    constructor(
        private firestore: FirebaseFirestore.Firestore,
        ) {}

    public async getMatch(matchPath: string): Promise<Match> {
        return (await this.firestore.doc(matchPath).get()).data() as Match;
    }
}