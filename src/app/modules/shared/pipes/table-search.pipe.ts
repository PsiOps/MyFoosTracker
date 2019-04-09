import { Pipe, PipeTransform } from '@angular/core';
import { TableManageModel } from '../models/table-manage.model';

@Pipe({
  name: 'tableSearch'
})
export class TableSearchPipe implements PipeTransform {

  transform(tables: TableManageModel[], terms: string): any[] {
    if (!tables) {
      return [];
    }
    if (!terms) {
      return tables;
    }

    terms = terms.toLowerCase();

    return tables.filter(it => {
      return it.name.toLowerCase().includes(terms);
    });
  }

}
