import { Component } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from '../domain/player';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  constructor(public authService: AuthenticationService, private afs: AngularFirestore, private router: Router) { }
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
