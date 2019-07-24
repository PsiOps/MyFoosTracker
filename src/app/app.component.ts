import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UpdateService } from './services/update-service';
import { MessagingService } from './services/messaging.service';
import { filter, skip } from 'rxjs/operators';
import { PlayerService } from './services/player.service';
import { AuthenticationService } from './auth/authentication.service';

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
    private authService: AuthenticationService,
    private playerService: PlayerService,
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
      this.playerService.player$
        .pipe(filter(player => !!player))
        .subscribe(player => {
          this.messagingService.requestPermission(player);
          this.messagingService.monitorTokenRefresh(player);
          this.messagingService.receiveMessages();
        });
    });
  }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      translucent: true
    });
    await loading.present();

    this.authService.user$
      .pipe(skip(1))
      .subscribe(async user => {
        await this.loadingController.dismiss();
      });
  }
}
