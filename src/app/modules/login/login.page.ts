import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    const returnUrl = localStorage.getItem('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }

  public async proceedWithGoogle() {
    await this.authService.loginWithGoogle();
  }

  public async proceedWithGithub() {
    await this.authService.loginWithGithub();
  }

  public async proceedWithTwitter() {
    await this.authService.loginWithTwitter();
  }

  public async proceedWithFacebook() {
    await this.authService.loginWithFacebook();
  }
}
