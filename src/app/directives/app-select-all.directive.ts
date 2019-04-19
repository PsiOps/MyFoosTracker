import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'ion-input[appSelectAll]'
})
export class AppSelectAllDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  selectAll() {
    // access to the native input element
    const nativeElement: HTMLInputElement = this.el.nativeElement.querySelector('input');

    if (nativeElement) {
      nativeElement.select();
    }
  }
}
