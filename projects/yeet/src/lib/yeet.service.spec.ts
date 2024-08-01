import { TestBed } from '@angular/core/testing';

import { YeetService } from './yeet.service';

describe('YeetService', () => {
  let service: YeetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YeetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
