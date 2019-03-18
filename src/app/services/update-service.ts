import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastController } from '@ionic/angular';
import { tap, switchMap, map, withLatestFrom, flatMap, mergeMap } from 'rxjs/operators';
import { OverlayEventDetail } from '@ionic/core';
import { of } from 'rxjs';

@Injectable()
export class UpdateService {
    constructor(
        private swUpdate: SwUpdate,
        private toastController: ToastController) {

        if (!this.swUpdate.isEnabled) {
            console.log('PWA update available check is disabled...');
        }

        this.swUpdate.available.pipe(
            tap((event) => console.log('PWA update available', event)),
            switchMap(() => this.displayUpdateMessage()),
            tap((result: OverlayEventDetail<any>) => {
                console.log('PWA update available - message result', result);
                // It's a bit weird but the toast only has a cancel? Perhaps a different component is better suited
                if (result.role === 'cancel') {
                    window.location.reload();
                }
            }),
        ).subscribe();
    }

    public async displayUpdateMessage(): Promise<OverlayEventDetail<any>> {
        const toast = await this.toastController.create({
            message: 'A new update is available!',
            showCloseButton: true,
            duration: 7000,
            position: 'bottom',
            color: 'primary',
            closeButtonText: 'Install'
        });

        await toast.present();

        return await toast.onWillDismiss();
    }
}
