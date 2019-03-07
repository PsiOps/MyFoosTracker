import * as admin from 'firebase-admin';

export class Player {
    nickname: string;
    lastLogin: Date;
    defaultTableRef: admin.firestore.DocumentReference;
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    fcmTokens?: { [token: string]: boolean };
}
