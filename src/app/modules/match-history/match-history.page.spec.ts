import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchHistoryPage } from './match-history.page';

describe('MatchHistoryPage', () => {
  let component: MatchHistoryPage;
  let fixture: ComponentFixture<MatchHistoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MatchHistoryPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
