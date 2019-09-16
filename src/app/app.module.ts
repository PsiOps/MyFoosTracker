import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { UpdateService } from './services/update-service';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@NgModule({
  declarations: [
    AppComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp({
      apiKey: environment.apiKey,
      authDomain: 'myfoostracker.firebaseapp.com',
      databaseURL: 'https://myfoostracker.firebaseio.com',
      projectId: 'myfoostracker',
      storageBucket: 'myfoostracker.appspot.com',
      messagingSenderId: '786590478328'
    }),
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireMessagingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UpdateService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    FirebaseDynamicLinks,
    SocialSharing
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
