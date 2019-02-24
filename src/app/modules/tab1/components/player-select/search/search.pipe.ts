import { Pipe, PipeTransform } from '@angular/core';
import { PlayerSelectModel } from '../player-select.model';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

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
