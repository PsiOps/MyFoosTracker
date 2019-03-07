import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();
import * as functions from 'firebase-functions';
import { StatsUpdateService } from './services/stats-update.service';
import { StatsRecalcService } from './services/stats-recalc.service';
import { Player } from './domain/player';

const statsUpdateService = new StatsUpdateService(firestore);

export const updatePlayerStats = functions.https.onCall(async (data, context) => {
    return await statsUpdateService.updateStatsForMatch(data.matchPath);
});
export const recalculatePlayerStats = functions.https.onRequest(async (req, res) => {
    console.log('Starting recalculation');
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
    const message = await statsRecalcService.recalculateStatistics();
    res.send(message);
});
export const markForRecalculation = functions.https.onRequest(async (req, res) => {
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
    const message = await statsRecalcService.markForRecalculation();
    res.send(message);
});
export const testNotifications = functions.https.onRequest(async (req, res) => {
    const testPlayer = (await firestore.doc(`players/SrjvBNMltdRZ2jQsV8bd6kpwIm53`).get()).data() as Player;
    const payload: admin.messaging.MessagingPayload = {
        data: {
            data_type: "direct_message",
            title: "New Message from FoosTracker",
            message: "Yo yo wassup"
        },
        notification: {
            data_type: "direct_message",
            title: "New Message from FoosTracker",
            message: "Yo yo wassup"
        }
    };
    const result =[];
    for(const token in testPlayer.fcmTokens){
        result.push(await admin.messaging().sendToDevice(token, payload))
    }
    res.send(result);
});