import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { PageNavigation } from './page-navigation';

describe('PageNavigation', () => {
  it('loads the page from scratch so the shell reads the new session', () => {
    const assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { location: { assign } } }],
    });

    TestBed.inject(PageNavigation).open('/appointment');

    expect(assign).toHaveBeenCalledWith('/appointment');
  });
});
