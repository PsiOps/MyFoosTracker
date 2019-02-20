import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectPage } from './user-select.page';

describe('UserSelectPage', () => {
  let component: UserSelectPage;
  let fixture: ComponentFixture<UserSelectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSelectPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
