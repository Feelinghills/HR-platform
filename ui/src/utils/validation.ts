export function required(value: string): boolean {
  return value.trim().length > 0;
}

export function hasAtLeastTwoWords(value: string): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2;
}

export function isValidPhone(value: string): boolean {
  return /^\+7\s*\(\d{3}\)\s*\d{3}-\d{2}-\d{2}$/.test(value.trim());
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  const part = digits.startsWith('7') ? digits.slice(1) : digits;
  let result = '+7';
  if (part.length > 0) result += ' (' + part.slice(0, 3);
  if (part.length >= 3) result += ') ';
  if (part.length > 3) result += part.slice(3, 6);
  if (part.length > 6) result += '-' + part.slice(6, 8);
  if (part.length > 8) result += '-' + part.slice(8, 10);
  return result;
}

export function isValidEmail(value: string): boolean {
  if (!required(value)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isFormValid(fields: Record<string, { value: string; validators: ((v: string) => boolean)[] }>): boolean {
  return Object.values(fields).every((f) => f.validators.every((v) => v(f.value)));
}
