import { Component, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() title: string;

  constructor(
    private authService: AuthenticationService,
    private router: Router) { }

  public home() {
    this.router.navigateByUrl('/');
  }

  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
