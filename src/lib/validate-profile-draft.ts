const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// PH mobile numbers: 09XXXXXXXXX or (+63|63)9XXXXXXXXX, ignoring spaces/dashes/parens.
const PH_PHONE_PATTERN = /^(\+?63|0)9\d{9}$/;

export function isValidContactDetails(value: string): boolean {
  const trimmed = value.trim();
  if (EMAIL_PATTERN.test(trimmed)) return true;
  const digitsOnly = trimmed.replace(/[\s\-().]/g, "");
  return PH_PHONE_PATTERN.test(digitsOnly);
}

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}

export function validateProfileDraftFields(draft: {
  name: string;
  contactDetails: string;
}): string[] {
  const errors: string[] = [];
  if (!isValidName(draft.name)) {
    errors.push("Full name is required.");
  }
  if (!isValidContactDetails(draft.contactDetails)) {
    errors.push("Enter a valid PH phone number (e.g. 0917 123 4567) or email address.");
  }
  return errors;
}
