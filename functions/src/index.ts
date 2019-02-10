import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();

const updateStatsForPlayer = async (playerId: string) => {
    const docRef = firestore.doc(`player-stats/${playerId}`);
    await firestore.runTransaction(async transaction => {
        const doc = await transaction.get(docRef);
        const currentStats = doc.data();
        if (!currentStats) {
            transaction.set(docRef, { matchesWon: 1 })
            return;
        }
        const newMatchesWonValue = currentStats.matchesWon + 1;
        transaction.update(docRef, { matchesWon: newMatchesWonValue })
    });
}

export const updatePlayerStats = functions.https.onCall(async (data, context) => {    
    const match = (await firestore.doc(data.matchPath).get()).data();
    console.log('Found match:', match);
    if(!match) { return; }
    match.teamA.forEach((tm: {playerRef: {id: string}}) => updateStatsForPlayer(tm.playerRef.id));
    match.teamB.forEach((tm: {playerRef: {id: string}}) => updateStatsForPlayer(tm.playerRef.id));
    return { message: 'Succes' }
});
