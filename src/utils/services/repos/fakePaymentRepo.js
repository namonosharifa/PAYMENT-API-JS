class FakePaymentRepo {
    constructor() {
        this.payments = new Map();
        this.customers = new Map();
        this.refunds = new Map();
    }

    savePayment(payment) {
        this.payments.set(payment.id, payment);
        return payment;
    }

    findPaymentById(id) {
        return this.payments.get(id) || null;
    }

    // ... existing customer/payment methods ...

    saveRefund(refund) {
        this.refunds.set(refund.id, refund);
        return refund;
    }

    findRefundById(id) {
        return this.refunds.get(id) || null;
    }

    getRefundsByPaymentId(paymentId) {
        const result = [];
        for (let [id, refund] of this.refunds) {
            if (refund.paymentId === paymentId) result.push(refund);
        }
        return result;
    }
}

class FakePaymentRepo {
    // ... keep existing methods ...

    getPaymentsByCustomerId(customerId) {
        const result = [];
        for (let [id, payment] of this.payments) {
            if (payment.customerId === customerId) result.push(payment);
        }
        return result;
    }

    getAllPayments() {
        return Array.from(this.payments.values());
    }
}

module.exports = FakePaymentRepo;