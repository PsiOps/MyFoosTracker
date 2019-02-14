import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();

export const updatePlayerStats = functions.https.onCall(async (data, context) => {
    const match = data;
    for (let i = 0; i < match.participants.length; i++) {
        const playerId = match.participants[i];
        console.log('Handling participant:', playerId);
        const docRef = firestore.doc(`player-stats/${playerId}`);
        await firestore.runTransaction(async transaction => {
            console.log('Starting transaction')
            const doc = await transaction.get(docRef);
            const currentStats = doc.data();
            if (!currentStats) {
                console.log('Document data not found');
                transaction.set(docRef, { matchesWon: 1 })
                return;
            }
            console.log('Updating existing Stats record');
            const newMatchesWonValue = currentStats.matchesWon + 1;
            transaction.update(docRef, { matchesWon: newMatchesWonValue })
        });
    }
    // match.participants.forEach(async (playerId: number) => {
    //     const docRef = firestore.doc(`player-stats/${playerId}`);
    //     await firestore.runTransaction(async transaction => {
    //         const doc = await transaction.get(docRef);
    //         if (!doc) {
    //             transaction.set(docRef, { matchesWon: 1 })
    //             return;
    //         }
    //         const currentStats = doc.data();
    //         if(currentStats) {
    //             const newMatchesWonValue = currentStats.matchesWon + 1;
    //             transaction.update(docRef, { matchesWon: newMatchesWonValue })
    //         }          
    //     });
    // });
    //console.log('Function ran with data:', match);
    return { message: 'Something happened :)', data: match };
});
