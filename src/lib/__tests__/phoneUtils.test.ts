import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from '../phoneUtils';

/**
 * Bolivian number behavior (production implementation):
 * - `formatPhoneNumber` strips a 591 country code and returns 8-digit local
 *   numbers unchanged (display formatting is applied at the presentation layer).
 * - Unrecognized lengths are returned as-is.
 */
describe('phoneUtils', () => {
  describe('formatPhoneNumber', () => {
    describe('bolivian mobile numbers', () => {
      it('returns 8-digit local mobile unchanged', () => {
        const result = formatPhoneNumber('71234567');

        expect(result).toBe('71234567');
      });

      it('strips 591 country code from 11-digit input', () => {
        const result = formatPhoneNumber('59171234567');

        expect(result).toBe('71234567');
      });

      it('returns original for unrecognized 12-digit input (production behavior)', () => {
        expect(formatPhoneNumber('591712345670')).toBe('591712345670');
      });

      it('handles formatting characters and returns local digits', () => {
        expect(formatPhoneNumber('+591 7 123-4567')).toBe('71234567');
        expect(formatPhoneNumber('591-7123-4567')).toBe('71234567');
        expect(formatPhoneNumber('591 (7) 123 4567')).toBe('71234567');
      });

      it('preserves non-Bolivian 11-digit numbers as-is', () => {
        expect(formatPhoneNumber('11987654321')).toBe('11987654321');
      });
    });

    describe('invalid inputs', () => {
      it('returns N/A for null', () => {
        expect(formatPhoneNumber(null)).toBe('N/A');
      });

      it('returns N/A for undefined', () => {
        expect(formatPhoneNumber(undefined)).toBe('N/A');
      });

      it('returns N/A for empty string', () => {
        expect(formatPhoneNumber('')).toBe('N/A');
      });

      it('returns original for unrecognized digit lengths', () => {
        expect(formatPhoneNumber('+5511987654321')).toBe('+5511987654321'); // 13 digits, unrecognized
        expect(formatPhoneNumber('591712345670')).toBe('591712345670'); // 12 digits -> 9 local, unrecognized
      });

      it('returns original for non-numeric string', () => {
        expect(formatPhoneNumber('invalid-phone')).toBe('invalid-phone');
      });

      it('returns stripped digits for partially numeric string forming 8 digits', () => {
        expect(formatPhoneNumber('11abc654321')).toBe('11654321');
      });

      it('returns original string for whitespace-only input', () => {
        expect(formatPhoneNumber('   ')).toBe('   ');
      });

      it('returns original string for only special characters', () => {
        expect(formatPhoneNumber('()- ')).toBe('()- ');
      });
    });
  });
});
