import { AbstractControl, ValidationErrors } from '@angular/forms';

// Same limits as PasswordPolicy in telemed-ia-identity-and-access-api.
const MIN_CHARACTERS = 8;
const MAX_UTF8_BYTES = 72;
const STRONG_CHARACTERS = 12;

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'strong';

/** Length rules of identity-api; an empty value is left to Validators.required. */
export function passwordPolicy(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  if (characters(value) < MIN_CHARACTERS) {
    return { tooShort: true };
  }
  if (utf8Bytes(value) > MAX_UTF8_BYTES) {
    return { tooLong: true };
  }
  return null;
}

/** Guidance for the patient only; the API enforces nothing beyond the policy. */
export function passwordStrength(value: string): PasswordStrength {
  if (!value) {
    return 'empty';
  }
  if (characters(value) < MIN_CHARACTERS || utf8Bytes(value) > MAX_UTF8_BYTES) {
    return 'weak';
  }

  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((kind) => kind.test(value)).length;
  if (kinds >= 3 && characters(value) >= STRONG_CHARACTERS) {
    return 'strong';
  }
  return kinds >= 2 ? 'fair' : 'weak';
}

function characters(value: string): number {
  return [...value].length;
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}
