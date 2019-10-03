import { Component, Input } from '@angular/core';
import { Player } from 'src/app/domain';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-group',
  templateUrl: './no-group.component.html',
  styleUrls: ['./no-group.component.scss'],
})
export class NoGroupComponent {

  public isLoading = true;
  @Input() player: Player;
  @Input() set groupId(groupId: string) {
    if (!groupId) {
      // Only show the no group message (instead of a loader) if the incoming currentGroupId is null
      this.isLoading = false;
    }
  }

  constructor(
    private router: Router
  ) { }

  public async navigateToProfile() {
    await this.router.navigateByUrl('/profile');
  }
}
