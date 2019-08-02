import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SharedState } from 'src/app/state/shared.state';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() title: string;

  constructor(
    public state: SharedState,
    private router: Router) { }

  public home() {
    this.router.navigateByUrl('/');
  }

  public navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

}
