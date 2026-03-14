const request = require('supertest');
const app = require('../../src/app');
const PaymentService = require('../../src/services/paymentService');

jest.mock('../../src/services/paymentService');

describe('POST /payments/:id/refunds', () => {
    test('returns 201 when refund is successful', async () => {
        PaymentService.prototype.createRefund.mockResolvedValue({
            id: 'ref_1', paymentId: 'pay_1', amount: 1000, status: 'succeeded'
        });

        const res = await request(app).post('/payments/pay_1/refunds').send({ amount: 1000 });
        
        expect(res.status).toBe(201);
        expect(res.body.id).toBe('ref_1');
    });

    test('returns 422 when refund exceeds amount', async () => {
        PaymentService.prototype.createRefund.mockRejectedValue(
            new Error('Refund cannot exceed the original payment amount')
        );

        const res = await request(app).post('/payments/pay_1/refunds').send({ amount: 5000 });
        
        expect(res.status).toBe(422);
        expect(res.body.error).toBe('Refund cannot exceed the original payment amount');
    });
});