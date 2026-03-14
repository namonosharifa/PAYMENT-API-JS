const request = require('supertest');
const app = require('../../src/app');
const PaymentService = require('../../src/services/paymentService');

// Mock the service to isolate HTTP tests
jest.mock('../../src/services/paymentService');

describe('POST /payments', () => {
    test('returns 201 on valid input', async () => {
        PaymentService.prototype.createPayment.mockResolvedValue({ id: 'pay_1', status: 'pending' });
        
        const response = await request(app)
            .post('/payments')
            .send({ customerId: 'cus_1', amount: 1000, currency: 'usd' });
            
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('pending');
    });

    test('returns 500 with generic message when service throws unexpectedly', async () => {
        PaymentService.prototype.createPayment.mockRejectedValue(new Error('Database explosion'));
        
        const response = await request(app)
            .post('/payments')
            .send({ customerId: 'cus_1', amount: 1000, currency: 'usd' });
            
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Something went wrong' });
    });
});