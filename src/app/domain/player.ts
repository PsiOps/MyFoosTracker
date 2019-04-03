import { DocumentReference } from '@angular/fire/firestore';

export class Player {
    nickname: string;
    lastLogin: Date;
    defaultTableId: string;
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    watchingTableIds: string[] = [];
    fcmTokens?: { [token: string]: boolean };
}
