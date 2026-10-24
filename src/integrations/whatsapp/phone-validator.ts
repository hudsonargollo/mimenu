import { ValidationResult } from './types';

/**
 * Bolivian phone number validation and formatting utilities
 * Handles the +591 country code format and validates WhatsApp-compatible numbers
 *
 * Bolivian mobile numbers: 8 digits starting with 6 or 7.
 * Landlines: 8 digits starting with 2 (La Paz), 3 (Santa Cruz), 4 (Cochabamba), 5, etc.
 * — WhatsApp only accepts mobile numbers (6/7 prefix).
 */

// Bolivian phone number pattern
const BOLIVIA_COUNTRY_CODE = '591';
const BOLIVIAN_LOCAL_NUMBER_LENGTH = 8;
// WhatsApp only works with Bolivian mobile numbers: 6 or 7 prefix
const INITIAL_MOBILE_DIGITS = ['6', '7'];

/**
 * Validates and formats a Bolivian phone number for WhatsApp
 * @param phone - Phone number in various formats (+591XXXXXXXX, 591XXXXXXXX, 0XXXXXXXX, XXXXXXXX)
 * @returns ValidationResult with formatted number or error
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      error: 'Se requiere un número de teléfono',
    };
  }

  // Remove all non-digit characters (keeps leading digits only)
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: 'El número de teléfono no puede estar vacío',
    };
  }

  // Try to parse and validate the number
  let formattedNumber: string;
  let localNumber: string;

  try {
    // Case 1: Number already has country code (591XXXXXXXX)
    if (cleaned.startsWith(BOLIVIA_COUNTRY_CODE)) {
      const withoutCountryCode = cleaned.substring(3);

      // Bolivian mobile: 591 + 8 digits (total 11 digits)
      if (withoutCountryCode.length !== BOLIVIAN_LOCAL_NUMBER_LENGTH) {
        return {
          isValid: false,
          error: `Longitud de número boliviano inválida: ${cleaned.length} dígitos. Se esperan 591 + 8 dígitos.`,
        };
      }

      localNumber = withoutCountryCode;

      if (!isBolivianLocalMobile(localNumber)) {
        return {
          isValid: false,
          error: 'Los números móviles bolivianos deben comenzar con 6 o 7',
        };
      }

      formattedNumber = BOLIVIA_COUNTRY_CODE + localNumber;
    }
    // Case 2: Number starts with 0 (local operator prefix)
    else if (cleaned.startsWith('0')) {
      const withoutZero = cleaned.substring(1);

      if (withoutZero.length !== BOLIVIAN_LOCAL_NUMBER_LENGTH) {
        return {
          isValid: false,
          error: `Longitud de número inválida: ${cleaned.length} dígitos. Se esperan 0 + 8 dígitos.`,
        };
      }

      localNumber = withoutZero;

      if (!isBolivianLocalMobile(localNumber)) {
        return {
          isValid: false,
          error: 'Los números móviles bolivianos deben comenzar con 6 o 7',
        };
      }

      formattedNumber = BOLIVIA_COUNTRY_CODE + localNumber;
    }
    // Case 3: Bare 8-digit local mobile number
    else if (cleaned.length === BOLIVIAN_LOCAL_NUMBER_LENGTH) {
      localNumber = cleaned;

      if (!isBolivianLocalMobile(localNumber)) {
        return {
          isValid: false,
          error: 'Los números móviles bolivianos deben comenzar con 6 o 7',
        };
      }

      formattedNumber = BOLIVIA_COUNTRY_CODE + localNumber;
    } else {
      return {
        isValid: false,
        error: `Longitud de número de teléfono inválida: ${cleaned.length} dígitos. Se esperan 8 dígitos para un número móvil boliviano.`,
      };
    }

    // Final validation
    if (formattedNumber.length !== 11) {
      return {
        isValid: false,
        error: `Longitud del número formateado inválida: ${formattedNumber.length}. Se esperan 11 dígitos (591 + 8 dígitos).`,
      };
    }

    return {
      isValid: true,
      formattedNumber,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error al validar el número de teléfono: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

/**
 * Check if an 8-digit local Bolivian number is a valid mobile (WhatsApp-compatible)
 * @param localNumber - 8-digit local number
 * @returns true if the number starts with 6 or 7
 */
function isBolivianLocalMobile(localNumber: string): boolean {
  return (
    localNumber.length === BOLIVIAN_LOCAL_NUMBER_LENGTH &&
    INITIAL_MOBILE_DIGITS.includes(localNumber.substring(0, 1))
  );
}

/**
 * Format a phone number for display (with formatting)
 * @param phone - Phone number in international format
 * @returns Formatted string like +591 700 12345
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith(BOLIVIA_COUNTRY_CODE) && cleaned.length === 11) {
    const mobilePrefix = cleaned.substring(3, 6);
    const lastPart = cleaned.substring(6, 11);
    return `+${BOLIVIA_COUNTRY_CODE} ${mobilePrefix} ${lastPart}`;
  }

  return phone;
}

/**
 * Check if a phone number is a valid Bolivian mobile number
 * @param phone - Phone number to check
 * @returns true if valid Bolivian mobile number
 */
export function isBolivianMobile(phone: string): boolean {
  const result = validatePhoneNumber(phone);
  return result.isValid;
}

/**
 * @deprecated Use isBolivianMobile instead. Kept as an alias for backwards compatibility.
 * Check if a phone number is a valid Bolivian mobile number
 * @param phone - Phone number to check
 * @returns true if valid Bolivian mobile number
 */
export function isBrazilianMobile(phone: string): boolean {
  return isBolivianMobile(phone);
}

/**
 * Extract area code from a Bolivian phone number (first 3 digits of the local number)
 * @param phone - Phone number
 * @returns Area code or null if invalid
 */
export function extractAreaCode(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith(BOLIVIA_COUNTRY_CODE)) {
    const localNumber = cleaned.substring(3);
    if (localNumber.length >= 3) {
      return localNumber.substring(0, 3);
    }
    return null;
  }

  if (cleaned.startsWith('0')) {
    const withoutZero = cleaned.substring(1);
    if (withoutZero.length >= 3) {
      return withoutZero.substring(0, 3);
    }
    return null;
  }

  if (cleaned.length >= 3) {
    return cleaned.substring(0, 3);
  }

  return null;
}

/**
 * Batch validate multiple phone numbers
 * @param phones - Array of phone numbers
 * @returns Array of validation results
 */
export function validatePhoneNumbers(phones: string[]): ValidationResult[] {
  return phones.map(phone => validatePhoneNumber(phone));
}
