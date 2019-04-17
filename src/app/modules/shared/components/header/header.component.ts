import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Player } from 'src/app/domain';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() title: string;
  public player$: Observable<Player>;

  constructor(
    public authService: AuthenticationService,
    private router: Router) { }

  ngOnInit(): void {
    this.player$ = this.authService.playerDoc.valueChanges();
  }

  public home() {
    this.router.navigateByUrl('/');
  }

  public navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

}
