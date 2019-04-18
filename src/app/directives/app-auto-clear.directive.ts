import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'ion-input[appAutoClear]'
})
export class AppAutoClearDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  autoClear() {
    // access to the native input element
    const nativeElement: HTMLInputElement = this.el.nativeElement.querySelector('input');

    if (nativeElement) {
      nativeElement.value = '';
    }
  }
}
