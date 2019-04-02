import { DocumentReference } from '@angular/fire/firestore';

export class Player {
    nickname: string;
    lastLogin: Date;
    defaultTableRef: DocumentReference;
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    watchingTableIds: string[] = [];
    fcmTokens?: { [token: string]: boolean };
}
