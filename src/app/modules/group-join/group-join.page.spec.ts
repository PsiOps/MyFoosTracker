import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupJoinPage } from './group-join.page';

describe('GroupJoinPage', () => {
  let component: GroupJoinPage;
  let fixture: ComponentFixture<GroupJoinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupJoinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupJoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
