const { validateName, validateAmount } = require('../../src/utils/validators');

describe('Domain Rules Validation', () => {
    test('validateName returns true for valid names', () => {
        expect(validateName('Alice')).toBe(true);
    });
    
    test('validateName returns false if over 100 characters', () => {
        const longName = 'A'.repeat(101);
        expect(validateName(longName)).toBe(false);
    });

    test('validateAmount strictly rejects decimals to avoid floating-point errors', () => {
        expect(validateAmount(2999)).toBe(true); // £29.99 in pence
        expect(validateAmount(29.99)).toBe(false); // floats rejected
    });
});