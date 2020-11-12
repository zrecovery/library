import { TestBed } from '@angular/core/testing';

import { ArticlesListService } from './list.service';

describe('ArticlesListService', () => {
  let service: ArticlesListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticlesListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
