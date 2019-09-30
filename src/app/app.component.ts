import { Component, OnInit } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { UpdateService } from './services/update-service';
import { MessagingService } from './services/messaging.service';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from './auth/authentication.service';
import { SharedState } from './state/shared.state';
import { DynamicLinkService } from './services/dynamic-link.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {


  constructor(
    private platform: Platform,
    private updateService: UpdateService,
    private authService: AuthenticationService,
    private state: SharedState,
    private messagingService: MessagingService,
    private dynamicLinkService: DynamicLinkService,
    private loadingController: LoadingController,
    private splash: SplashScreen
  ) {
    this.initializeApp();

  }

  initializeApp() {
    this.loadingController.create({
      message: 'Please wait...',
      translucent: true
    }).then(loading => loading.present());

    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.splash.hide();
        this.dynamicLinkService.subscribe();
      }
      this.authService.user$
        .subscribe(user => {
          // Dismiss the loader if it's a new user
          if (!user) { this.loadingController.dismiss(); }
        });
      this.state.player$
        .pipe(filter(player => !!player))
        .subscribe(player => {
          // TODO: Errors in messaging service must be caught
          // this.messagingService.requestPermission(player);
          // this.messagingService.monitorTokenRefresh(player);
          // this.messagingService.receiveMessages();
          // Dismiss the loader when the player has finished loading
          this.loadingController.dismiss();
        });
    });
  }

  async ngOnInit() {
  }
}
