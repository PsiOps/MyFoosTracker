import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { tap } from 'rxjs/operators';

@Injectable()
export class UpdateService {
    constructor(
        private swUpdate: SwUpdate) {

        if (!this.swUpdate.isEnabled) {
            console.log('PWA update available check is disabled...');
        }

        this.swUpdate.available.pipe(
            tap(() => console.log('PWA update available')),
            tap(() => window.location.reload())
        ).subscribe();

        this.check();
    }

    private async check(): Promise<void> {
        if (!this.swUpdate.isEnabled) {
            console.log('PWA update available check is disabled...');

            return;
        }

        await this.swUpdate.activateUpdate();
    }
}
