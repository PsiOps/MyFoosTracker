import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Player } from 'src/app/domain';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() title: string;
  public player$: Observable<Player>;

  constructor(
    public playerService: PlayerService,
    private router: Router) { }

  public home() {
    this.router.navigateByUrl('/');
  }

  public navigateToProfile() {
    this.router.navigateByUrl('/profile');
  }

}
