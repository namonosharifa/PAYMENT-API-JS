const PaymentService = require('../../src/services/paymentService');
const FakePaymentRepo = require('../../src/repos/fakePaymentRepo');

describe('PaymentService - Refunds', () => {
    let service;
    let repo;

    beforeEach(() => {
        repo = new FakePaymentRepo();
        service = new PaymentService(repo);
    });

    test('successfully refunds a succeeded payment', async () => {
        // Setup: Create a succeeded payment manually in the fake repo
        repo.savePayment({ id: 'pay_1', amount: 2999, status: 'succeeded' });

        const refund = await service.createRefund('pay_1', 1000);
        
        expect(refund.id).toMatch(/^ref_/);
        expect(refund.amount).toBe(1000);
        expect(refund.status).toBe('succeeded');
    });

    test('throws error if payment is not succeeded', async () => {
        // Setup: Payment is still pending
        repo.savePayment({ id: 'pay_2', amount: 2999, status: 'pending' });

        await expect(service.createRefund('pay_2', 1000))
            .rejects.toThrow('Only succeeded payments can be refunded');
    });

    test('throws error if refund exceeds original amount', async () => {
        repo.savePayment({ id: 'pay_3', amount: 2999, status: 'succeeded' });

        await expect(service.createRefund('pay_3', 3000))
            .rejects.toThrow('Refund cannot exceed the original payment amount');
    });

    test('throws error if multiple refunds exceed original amount', async () => {
        repo.savePayment({ id: 'pay_4', amount: 2999, status: 'succeeded' });
        
        // First refund of 2000 is fine
        await service.createRefund('pay_4', 2000);

        // Second refund of 1000 pushes total to 3000 (exceeds 2999)
        await expect(service.createRefund('pay_4', 1000))
            .rejects.toThrow('Refund cannot exceed the original payment amount');
    });
});