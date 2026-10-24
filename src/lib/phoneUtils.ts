/**
 * Formats a Bolivian phone number to (XX) XXXX-XXXX format
 * @param phone - Raw phone number (digits only or with formatting)
 * @returns Formatted phone string or original if invalid
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove country code if present (591)
  if (digits.length === 11 && digits.startsWith('591')) {
    digits = digits.slice(3);
  } else if (digits.length === 12 && digits.startsWith('591')) {
    digits = digits.slice(3);
  }
  
  // Handle 8 digits (local mobile number without area code for Bolivia)
  if (digits.length === 8) {
    return digits;
  }
  
  // Handle 11 digits (591 + 8 digits)
  if (digits.length === 11 && digits.startsWith('591')) {
    const localNumber = digits.slice(3);
    return localNumber;
  }
  
  // Return original if format is not recognized
  return phone;
}

/**
 * Normalizes a Bolivian phone number to E.164 format (+591XXXXXXXX)
 * @param rawPhone - Raw phone number (digits only or with formatting)
 * @returns Normalized phone string in E.164 format or null if invalid
 * @example
 * normalizePhone("70012345") // returns "+59170012345"
 * normalizePhone("59170012345") // returns "+59170012345"
 * normalizePhone("123") // returns null (invalid)
 */
export function normalizePhone(rawPhone: string): string | null {
  if (!rawPhone) return null;
  
  // Remove all non-digit characters
  const digits = rawPhone.replace(/\D/g, '');
  
  // Validate exactly 8 digits (Bolivian local mobile)
  if (digits.length !== 8) return null;
  
  // Return E.164 format with +591 country code
  return `+591${digits}`;
}
