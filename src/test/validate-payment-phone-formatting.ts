/**
 * Test script to validate phone number formatting
 * Tests various input formats and edge cases for Bolivian phone numbers
 */

// Bolivian phone number formatter
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return 'N/A';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Bolivian numbers: 591 + 8 digits = 11 digits total
  // Expected format: 7XX XXXX or 6XX XXXX (8 digits)
  
  // If we have 11 digits starting with 591, strip the country code
  if (digits.length === 11 && digits.startsWith('591')) {
    const local = digits.slice(3);
    return `${local}`;  // e.g., "71234567"
  }
  
  // If we have 8 digits, format as XXXX XXXX
  if (digits.length === 8) {
    const firstPart = digits.slice(0, 4);
    const secondPart = digits.slice(4, 8);
    return `${firstPart} ${secondPart}`;  // e.g., "7123 4567"
  }
  
  // If we have 7 digits, pad with leading zero
  if (digits.length === 7) {
    const padded = '0' + digits;
    const firstPart = padded.slice(0, 4);
    const secondPart = padded.slice(4, 8);
    return `${firstPart} ${secondPart}`;
  }
  
  // Return original if format is not recognized
  return phone;
};

// Test cases for Bolivian phone numbers
const testCases = [
  {
    name: 'Full Bolivian international format (+591)',
    input: '+59171234567',
    expected: '712 34567',
    shouldFormat: true
  },
  {
    name: 'Bolivian format without + sign',
    input: '59171234567',
    expected: '712 34567',
    shouldFormat: true
  },
  {
    name: 'Local Bolivian mobile format (8 digits)',
    input: '71234567',
    expected: '712 34567',
    shouldFormat: true
  },
  {
    name: 'Local Bolivian format with space',
    input: '71234567',
    expected: '712 34567',
    shouldFormat: true
  },
  {
    name: 'Already formatted',
    input: '712 34567',
    expected: '712 34567',
    shouldFormat: true
  },
  {
    name: 'Short number (7 digits, padded)',
    input: '1234567',
    expected: '0123 4567',
    shouldFormat: true
  },
  {
    name: 'Extra digits (should use last 8)',
    input: '1234567890123',
    expected: '34567',
    shouldFormat: false
  },
  {
    name: 'Short number (6 digits)',
    input: '123456',
    expected: '123456',
    shouldFormat: false
  },
  {
    name: 'Very short number',
    input: '12345',
    expected: '12345',
    shouldFormat: false
  },
  {
    name: 'Empty string',
    input: '',
    expected: 'N/A',
    shouldFormat: false
  },
  {
    name: 'Only special characters',
    input: '()- ',
    expected: '()- ',
    shouldFormat: false
  },
  {
    name: 'Bolivian number with dashes',
    input: '712-34567',
    expected: '712 34567',
    shouldFormat: true
  }
];

console.log('Testing Bolivian Phone Number Formatter');
console.log('='.repeat(70));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const result = formatPhoneNumber(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    passedTests++;
    console.log('PASS: ' + testCase.name);
  } else {
    failedTests++;
    console.log('FAIL: ' + testCase.name);
    console.log('   Expected: ' + testCase.expected);
    console.log('   Got:      ' + result);
  }
  
  console.log('   Input:  ' + testCase.input);
  console.log('   Output: ' + result);
  console.log('');
});

console.log('='.repeat(70));
console.log('\nResults: ' + passedTests + ' passed, ' + failedTests + ' failed\n');
