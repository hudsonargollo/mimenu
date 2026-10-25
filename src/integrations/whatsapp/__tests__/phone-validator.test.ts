import { describe, it, expect } from 'vitest';
import { 
  validatePhoneNumber, 
  formatPhoneForDisplay, 
  isBolivianMobile,
  extractAreaCode 
} from '../phone-validator';

describe('Phone Validator', () => {
  describe('validatePhoneNumber', () => {
    it('should validate Bolivian mobile number with country code', () => {
      const result = validatePhoneNumber('59171234567');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('59171234567');
    });

    it('should validate Bolivian mobile number without country code', () => {
      const result = validatePhoneNumber('71234567');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('59171234567');
    });

    it('should validate Bolivian mobile number with leading zero', () => {
      const result = validatePhoneNumber('071234567');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('59171234567');
    });

    it('should validate number with formatting characters', () => {
      const result = validatePhoneNumber('+591 (7) 123-4567');
      expect(result.isValid).toBe(true);
      expect(result.formattedNumber).toBe('59171234567');
    });

    it('should reject landline numbers (starting with 2-5)', () => {
      const result = validatePhoneNumber('21234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Los números móviles bolivianos deben comenzar con 6 o 7');
    });

    it('should reject numbers without 8 digits', () => {
      const result = validatePhoneNumber('7123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Longitud');
    });

    it('should reject invalid area codes', () => {
      const result = validatePhoneNumber('81234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Los números móviles bolivianos deben comenzar con 6 o 7');
    });

    it('should reject empty phone number', () => {
      const result = validatePhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Se requiere');
    });

    it('should reject invalid length', () => {
      const result = validatePhoneNumber('7123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Longitud');
    });

    it('should validate different mobile prefixes (6 and 7)', () => {
      const result1 = validatePhoneNumber('61234567');
      const result2 = validatePhoneNumber('71234567');
      
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('formatPhoneForDisplay', () => {
    it('should format phone number for display', () => {
      const formatted = formatPhoneForDisplay('59171234567');
      expect(formatted).toBe('+591 712 34567');
    });

    it('should return original if not Bolivian format', () => {
      const formatted = formatPhoneForDisplay('123456789');
      expect(formatted).toBe('123456789');
    });
  });

  describe('isBolivianMobile', () => {
    it('should return true for valid Bolivian mobile', () => {
      expect(isBolivianMobile('59171234567')).toBe(true);
      expect(isBolivianMobile('71234567')).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isBolivianMobile('21234567')).toBe(false);
      expect(isBolivianMobile('invalid')).toBe(false);
    });
  });

  describe('extractAreaCode', () => {
    it('should extract area code from number with country code', () => {
      expect(extractAreaCode('59171234567')).toBe('712');
    });

    it('should extract area code from local number', () => {
      expect(extractAreaCode('71234567')).toBe('712');
    });

    it('should extract area code from number with leading zero', () => {
      expect(extractAreaCode('071234567')).toBe('712');
    });

    it('should return null for invalid number', () => {
      expect(extractAreaCode('1')).toBe(null);
    });
  });
});