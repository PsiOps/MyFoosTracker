import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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
    private authenticationService: AuthenticationService,
    private messagingService: MessagingService
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
  ngOnInit() {
    console.log('AppComponent ngOnInit');
    this.authenticationService.user$
      .pipe(filter(user => !!user)) // filter null
      .pipe(switchMap(u => this.authenticationService.playerDoc.valueChanges()))
      .pipe(take(1))
      .subscribe(player => {
        if (player) {
          this.messagingService.requestPermission(player);
          this.messagingService.monitorTokenRefresh(player);
          this.messagingService.receiveMessages();
        }
      });
  }
}
