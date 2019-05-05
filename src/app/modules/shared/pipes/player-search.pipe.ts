import { Pipe, PipeTransform } from '@angular/core';
import { PlayerSelectModel } from '../../tab1/models/player-select.model';

@Pipe({
  name: 'playerSearch'
})
export class PlayerSearchPipe implements PipeTransform {

  transform(players: PlayerSelectModel[], terms: string): any[] {
    if (!players) {
      return [];
    }
    if (!terms) {
      return players;
    }

    terms = terms.toLowerCase();

    return players.filter(it => {
      return it.nickname.toLowerCase().includes(terms);
    });
  }
}
