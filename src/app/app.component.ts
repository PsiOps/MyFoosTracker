import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { UpdateService } from './services/update-service';
import { MessagingService } from './services/messaging.service';
import { filter, skip } from 'rxjs/operators';
import { AuthenticationService } from './auth/authentication.service';
import { SharedState } from './state/shared.state';

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
    private state: SharedState,
    private messagingService: MessagingService,
    private loadingController: LoadingController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.loadingController.create({
      message: 'Please wait...',
      translucent: true
    }).then(loading => loading.present());

    this.platform.ready().then(() => {
      if (this.platform.is('ios') || this.platform.is('android')) {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
      this.authService.user$
        .pipe(skip(1))
        .subscribe(user => {
          // Dismiss the loader if it's a new user
          if (!user) {this.loadingController.dismiss(); }
        });
      this.state.player$
        .pipe(filter(player => !!player))
        .subscribe(player => {
          this.messagingService.requestPermission(player);
          this.messagingService.monitorTokenRefresh(player);
          this.messagingService.receiveMessages();
          // Dismiss the loader when the player has finished loading
          this.loadingController.dismiss();
        });
    });
  }

  async ngOnInit() {
  }
}
