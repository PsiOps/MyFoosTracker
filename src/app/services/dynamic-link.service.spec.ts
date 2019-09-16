import { TestBed } from '@angular/core/testing';

import { DynamicLinkService } from './dynamic-link.service';

describe('DynamicLinkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicLinkService = TestBed.get(DynamicLinkService);
    expect(service).toBeTruthy();
  });
});
