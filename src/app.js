const express = require('express');
const app = express();
app.use(express.json());

const PaymentService = require('./services/paymentService');
const FakePaymentRepo = require('./repos/fakePaymentRepo');
const service = new PaymentService(new FakePaymentRepo());

// Helper for standardizing error responses
const handleError = (res, error) => {
    const msg = error.message;
    if (msg.includes('not found')) return res.status(404).json({ error: msg });
    if (msg.includes('exceed') || msg.includes('Can only') || msg.includes('Cannot')) {
        return res.status(422).json({ error: msg }); // Unprocessable Entity for logic rules
    }
    if (msg.includes('Invalid') || msg.includes('required') || msg.includes('exists')) {
        return res.status(400).json({ error: msg });
    }
    console.error(error); // Log internal errors for debugging
    res.status(500).json({ error: 'Internal Server Error' });
};

// --- CUSTOMERS ---
app.post('/customers', async (req, res) => {
    try {
        const { name, email } = req.body;
        const customer = await service.createCustomer(name, email);
        res.status(201).json(customer);
    } catch (e) { handleError(res, e); }
});

app.get('/customers/:id', async (req, res) => {
    try {
        const customer = await service.getCustomer(req.params.id);
        res.status(200).json(customer);
    } catch (e) { handleError(res, e); }
});

app.get('/customers/:id/payments', async (req, res) => {
    try {
        const payments = await service.getCustomerPayments(req.params.id);
        res.status(200).json(payments);
    } catch (e) { handleError(res, e); }
});

// --- PAYMENTS ---
app.post('/payments', async (req, res) => {
    try {
        const { customerId, amount, currency } = req.body;
        const payment = await service.createPayment(customerId, amount, currency);
        res.status(201).json(payment);
    } catch (e) { handleError(res, e); }
});

app.get('/payments', async (req, res) => {
    try {
        const { status } = req.query; // Optional filter: /payments?status=succeeded
        const payments = await service.getAllPayments(status);
        res.status(200).json(payments);
    } catch (e) { handleError(res, e); }
});

app.get('/payments/:id', async (req, res) => {
    try {
        const payment = await service.getPayment(req.params.id);
        res.status(200).json(payment);
    } catch (e) { handleError(res, e); }
});

app.post('/payments/:id/capture', async (req, res) => {
    try {
        const payment = await service.capture(req.params.id);
        res.status(200).json(payment);
    } catch (e) { handleError(res, e); }
});

app.post('/payments/:id/fail', async (req, res) => {
    try {
        const payment = await service.fail(req.params.id);
        res.status(200).json(payment);
    } catch (e) { handleError(res, e); }
});

// --- REFUNDS ---
app.post('/refunds', async (req, res) => {
    try {
        const { paymentId, amount } = req.body;
        if (!paymentId || amount == null) throw new Error('Payment ID and amount are required');
        
        const refund = await service.createRefund(paymentId, amount);
        res.status(201).json(refund);
    } catch (e) { handleError(res, e); }
});

app.get('/refunds/:id', async (req, res) => {
    try {
        const refund = await service.getRefund(req.params.id);
        res.status(200).json(refund);
    } catch (e) { handleError(res, e); }
});

module.exports = app;