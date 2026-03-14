const { validateAmount, validateCurrency, validateEmail, generateId } = require('../validators');

const STATUS = {
    PENDING: 'pending',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed'
};

class PaymentService {
    constructor(repo) {
        this.repo = repo;
    }

    async createPayment(customerId, amount, currency) {
        if (!validateAmount(amount)) throw new Error('Invalid amount');
        if (!validateCurrency(currency)) throw new Error('Invalid currency');
        // Assume customer exists for simplicity

        const payment = {
            id: generateId('pay'),
            customerId,
            amount,
            currency,
            status: STATUS.PENDING
        };

        this.repo.savePayment(payment);
        return payment;
    }

    async capture(paymentId) {
        const payment = this.repo.findPaymentById(paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.status !== STATUS.PENDING) throw new Error('Cannot capture');

        payment.status = STATUS.SUCCEEDED;
        this.repo.savePayment(payment);
        return payment;
    }

    // ... existing createCustomer, createPayment, capture ...

    async createRefund(paymentId, amount) {
        const payment = this.repo.findPaymentById(paymentId);
        
        if (!payment) throw new Error('Payment not found');
        if (payment.status !== STATUS.SUCCEEDED) throw new Error('Only succeeded payments can be refunded');
        if (!validateAmount(amount)) throw new Error('Invalid refund amount: must be integer >= 1');

        // Calculate total already refunded
        const existingRefunds = this.repo.getRefundsByPaymentId(paymentId);
        const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);

        if (totalRefunded + amount > payment.amount) {
            throw new Error('Refund cannot exceed the original payment amount');
        }

        const refund = {
            id: generateId('ref'),
            paymentId,
            amount,
            status: STATUS.SUCCEEDED // Assuming refunds succeed instantly in this sandbox
        };

        return this.repo.saveRefund(refund);
    }
}

class PaymentService {
    // ... keep createCustomer, createPayment, capture, etc. ...

    // --- NEW RETRIEVAL METHODS ---
    async getCustomer(id) {
        const customer = this.repo.findCustomerById(id);
        if (!customer) throw new Error('Customer not found');
        return customer;
    }

    async getCustomerPayments(customerId) {
        // Verify customer exists first
        await this.getCustomer(customerId); 
        return this.repo.getPaymentsByCustomerId(customerId);
    }

    async getPayment(id) {
        const payment = this.repo.findPaymentById(id);
        if (!payment) throw new Error('Payment not found');
        return payment;
    }

    async getRefund(id) {
        const refund = this.repo.findRefundById(id);
        if (!refund) throw new Error('Refund not found');
        return refund;
    }

    async getAllPayments(statusFilter) {
        let payments = this.repo.getAllPayments();
        if (statusFilter) {
            payments = payments.filter(p => p.status === statusFilter);
        }
        return payments;
    }

    // --- NEW STATE MUTATION ---
    async fail(paymentId) {
        const payment = this.repo.findPaymentById(paymentId);
        if (!payment) throw new Error('Payment not found');
        if (payment.status !== STATUS.PENDING) {
            throw new Error('Can only fail pending payments');
        }
        payment.status = STATUS.FAILED;
        return this.repo.savePayment(payment);
    }
}
module.exports = PaymentService;