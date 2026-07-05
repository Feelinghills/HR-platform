export function required(value: string): boolean {
  return value.trim().length > 0;
}

export function hasAtLeastTwoWords(value: string): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2;
}

export function isValidPhone(value: string): boolean {
  return /^\+7\s*\(\d{3}\)\s*\d{3}-\d{2}-\d{2}$/.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  if (!required(value)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isFormValid(fields: Record<string, { value: string; validators: ((v: string) => boolean)[] }>): boolean {
  return Object.values(fields).every((f) => f.validators.every((v) => v(f.value)));
}
