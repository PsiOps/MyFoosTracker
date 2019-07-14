import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(public authService: AuthenticationService, private router: Router) {
    this.authService.user$.subscribe(u => {
      if (u) {
        this.router.navigateByUrl('/tabs/home');
      }
    });
  }

  ngOnInit() { }

  public async proceedWithGoogle() {
    console.log('Proceed with Google Login');
    await this.authService.login();
  }
}
