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
    console.log('Login: found returnUrl', returnUrl);
    this.router.navigateByUrl(returnUrl);
  }

  public async proceedWithGoogle() {
    console.log('Proceed with Google Login');
    await this.authService.login();
  }
}
