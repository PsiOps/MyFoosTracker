import { Component, OnInit } from '@angular/core';

import { Platform, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UpdateService } from './services/update-service';
import { MessagingService } from './services/messaging.service';
import { AuthenticationService } from './auth/authentication.service';
import { filter, take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private updateService: UpdateService,
    private authenticationService: AuthenticationService,
    private messagingService: MessagingService,
    private loadingController: LoadingController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios') || this.platform.is('android')) {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
    });
  }

  async ngOnInit() {
    console.log('AppComponent ngOnInit');
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      translucent: true
    });
    await loading.present();
    this.authenticationService.user$
      .pipe(filter(user => !!user)) // filter null
      .pipe(switchMap(u => this.authenticationService.playerDoc.valueChanges()))
      .pipe(take(1))
      .subscribe(player => {
        if (player) {
          this.messagingService.requestPermission(player);
          this.messagingService.monitorTokenRefresh(player);
          this.messagingService.receiveMessages();
          this.loadingController.dismiss();
        }
      });
  }
}
