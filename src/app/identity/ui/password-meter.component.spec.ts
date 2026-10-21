import { TestBed } from '@angular/core/testing';
import { PasswordMeterComponent } from './password-meter.component';

describe('PasswordMeterComponent', () => {
  function render(password: string) {
    const fixture = TestBed.createComponent(PasswordMeterComponent);
    fixture.componentRef.setInput('password', password);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('stays quiet until there is something to rate', () => {
    const meter = render('');

    expect(meter.textContent?.trim()).toBe('');
    expect(meter.getAttribute('data-strength')).toBe('empty');
  });

  it('names the rating in words, not only in colour', () => {
    expect(render('abcdefgh').textContent).toContain('Seguridad: Débil');
    expect(render('abcdef12').textContent).toContain('Seguridad: Aceptable');
    expect(render('Consulta-2026').textContent).toContain('Seguridad: Fuerte');
  });

  it('announces changes politely to screen readers', () => {
    const meter = render('Consulta-2026');

    expect(meter.getAttribute('aria-live')).toBe('polite');
    expect(meter.getAttribute('data-strength')).toBe('strong');
  });
});
