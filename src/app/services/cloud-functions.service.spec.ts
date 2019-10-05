import { TestBed } from '@angular/core/testing';

import { CloudFunctionsService } from './cloud-functions.service';

describe('CloudFunctionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CloudFunctionsService = TestBed.get(CloudFunctionsService);
    expect(service).toBeTruthy();
  });
});
