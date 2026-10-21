import { FormControl } from '@angular/forms';
import { passwordPolicy, passwordStrength } from './password-policy';

describe('passwordPolicy', () => {
  const validate = (value: string) => passwordPolicy(new FormControl(value));

  it('leaves empty values to Validators.required', () => {
    expect(validate('')).toBeNull();
  });

  it('rejects a password made only of spaces, as identity-api does', () => {
    expect(validate(' '.repeat(10))).toEqual({ blank: true });
  });

  it('asks for at least 8 characters, counted like identity-api', () => {
    expect(validate('Abc123!')).toEqual({ tooShort: true });
    expect(validate('Abc123!x')).toBeNull();
    // 7 emoji are 7 characters for the API, not 14 UTF-16 units.
    expect(validate('🙂'.repeat(7))).toEqual({ tooShort: true });
  });

  it('rejects passwords over the 72 UTF-8 bytes BCrypt can hash', () => {
    expect(validate('a'.repeat(72))).toBeNull();
    expect(validate('a'.repeat(73))).toEqual({ tooLong: true });
    expect(validate('ñ'.repeat(37))).toEqual({ tooLong: true });
  });
});

describe('passwordStrength', () => {
  it('has nothing to rate on an empty field', () => {
    expect(passwordStrength('')).toBe('empty');
  });

  it('rates passwords the API would reject as weak', () => {
    expect(passwordStrength('Ab1!')).toBe('weak');
    expect(passwordStrength('a'.repeat(73))).toBe('weak');
  });

  it('rates a single kind of character as weak', () => {
    expect(passwordStrength('abcdefgh')).toBe('weak');
  });

  it('rates mixed characters as fair', () => {
    expect(passwordStrength('abcdef12')).toBe('fair');
  });

  it('rates long and varied passwords as strong', () => {
    expect(passwordStrength('Consulta-2026')).toBe('strong');
  });
});
