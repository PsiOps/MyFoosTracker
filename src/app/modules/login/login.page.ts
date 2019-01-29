import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { mergeMap, tap, switchMap, withLatestFrom, first, filter } from 'rxjs/operators';
import { Player } from 'src/app/domain/player';
import { Router } from '@angular/router';
import { merge, of, zip, combineLatest } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(public authService: AuthenticationService, private afs: AngularFirestore, private router: Router) {
    this.authService.user$.subscribe(u => {
      if (u) {
        this.router.navigateByUrl('/tabs/tab1');
      }
    });
  }
  ngOnInit() { }
  public async proceedWithGoogle() {
    console.log('Proceed with Google Login');
    await this.authService.login();
  }
}
