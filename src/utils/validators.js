function validateName(name) {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
}

function validateAmount(amount) {
    // Must be an integer (pence/cents) and >= 1
    return Number.isInteger(amount) && amount >= 1;
}

function validateCurrency(currency) {
    return typeof currency === 'string' && currency.length === 3;
}

function validateEmail(email) {
    return typeof email === 'string' && email.includes('@') && email.includes('.');
}

function generateId(prefix) {
    return prefix + Math.random().toString(36).substr(2, 9);
}

module.exports = { validateName, validateAmount, validateCurrency, validateEmail, generateId };