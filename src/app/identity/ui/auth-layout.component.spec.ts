import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

@Component({
  imports: [AuthLayoutComponent],
  template: `
    <app-auth-layout heading="Tu salud, siempre a tu alcance." lede="Consulta y agenda en un solo lugar.">
      <form aria-label="Formulario de prueba"></form>
    </app-auth-layout>
  `,
})
class HostComponent {}

describe('AuthLayoutComponent', () => {
  function render(): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the heading and lede of the page in the visual panel', () => {
    const page = render();

    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Tu salud, siempre a tu alcance.');
    expect(page.textContent).toContain('Consulta y agenda en un solo lugar.');
  });

  it('places the page form inside the main landmark', () => {
    const page = render();

    expect(page.querySelector('main form[aria-label="Formulario de prueba"]')).not.toBeNull();
  });

  it('treats the photo and the pulse line as decoration', () => {
    const page = render();

    expect(page.querySelector('img.photo')?.getAttribute('alt')).toBe('');
    expect(page.querySelector('svg.pulse')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('names the brand link for assistive technology', () => {
    const page = render();

    expect(page.querySelector('a.brand')?.getAttribute('aria-label')).toBe('TeleMed IA, inicio');
  });

  it('loads the brand font when rendered inside the shell', () => {
    render();

    expect(document.head.querySelector('link[data-tm-font]')).not.toBeNull();
  });
});
