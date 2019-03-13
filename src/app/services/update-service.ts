import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastController } from '@ionic/angular';
import { tap, switchMap, map } from 'rxjs/operators';
import { OverlayEventDetail } from '@ionic/core';

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
            map(() => this.displayUpdateMessage),
            tap((result) => console.log('Dismissed', result)),
        ).subscribe();
    }

    public async displayUpdateMessage(): Promise<OverlayEventDetail> {
        const toast = await this.toastController.create({
            message: 'A new update is available!',
            showCloseButton: true,
            position: 'bottom',
            closeButtonText: 'Install',
            cssClass: 'update-toast'
        });

        await toast.present();

        return await toast.onWillDismiss();
    }
}
