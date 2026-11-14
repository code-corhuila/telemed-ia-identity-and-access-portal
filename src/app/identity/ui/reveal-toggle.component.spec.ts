import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealToggleComponent } from './reveal-toggle.component';

@Component({
  imports: [RevealToggleComponent],
  template: `<button appRevealToggle [(visible)]="visible"></button>`,
})
class HostComponent {
  readonly visible = signal(false);
}

describe('RevealToggleComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, button };
  }

  it('is a labelled button that does not submit the form', () => {
    const { button } = render();

    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Mostrar contraseña');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.classList).toContain('reveal');
  });

  it('toggles the bound visibility and its pressed state', () => {
    const { fixture, button } = render();

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');

    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('switches to the crossed-out eye while the password is visible', () => {
    const { fixture, button } = render();
    expect(button.querySelector('circle')).not.toBeNull();

    button.click();
    fixture.detectChanges();

    expect(button.querySelector('circle')).toBeNull();
  });
});
