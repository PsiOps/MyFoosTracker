import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();
import * as functions from 'firebase-functions';
import { StatsUpdateService } from './services/stats-update.service';
import { StatsRecalcService } from './services/stats-recalc.service';

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
