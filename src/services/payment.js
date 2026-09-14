import { dbService } from '../firebase/config';

const postPaymentRequest = async (path, body) => {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Payment service is temporarily unavailable.');
    }
    return data;
  } catch (err) {
    // Re-throw with a friendly message; preserves the original if it was already set
    throw new Error(err.message || 'Network error. Please check your connection and try again.');
  }
};

export const paymentService = {
  initiateDonation: async ({ amount }) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 200000) {
      throw new Error('Donation amount must be between Rs. 1 and Rs. 2,00,000.');
    }

    return postPaymentRequest('/api/payments/create-order', { amount: numericAmount });
  },

  processPaymentResponse: async (donorDetails, paymentResponse) => {
    const verification = await postPaymentRequest('/api/payments/verify', {
      orderId: paymentResponse.orderId,
      paymentId: paymentResponse.paymentId,
      signature: paymentResponse.signature
    });

    if (!verification.verified) throw new Error('Payment verification failed.');

    const donationRecord = {
      userId: donorDetails.userId || 'guest',
      donorName: donorDetails.donorName,
      phone: donorDetails.phone,
      email: donorDetails.email || '',
      amount: Number(donorDetails.amount),
      donationDate: donorDetails.donationDate || new Date().toISOString().split('T')[0],
      message: donorDetails.message || '',
      receiptImage: donorDetails.receiptImage || '',
      paymentMethod: donorDetails.paymentMethod,
      purpose: donorDetails.purpose || 'General Seva',
      paymentId: paymentResponse.paymentId,
      orderId: paymentResponse.orderId,
      status: 'Pending',
      hasAddedToIncome: false,
      approvedAt: null,
      approvedBy: null,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return dbService.donations.add(donationRecord);
  },

  recordQrDonation: async (donorDetails, transactionRef) => {
    const numericAmount = Number(donorDetails.amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 1) {
      throw new Error('Donation amount must be greater than zero.');
    }

    const orderId = `SAZ-QR-${Date.now()}`;
    const paymentId = transactionRef?.trim() || `UPI-QR-${Date.now().toString().slice(-8)}`;

    const donationRecord = {
      userId: donorDetails.userId || 'guest',
      donorName: donorDetails.donorName,
      phone: donorDetails.phone,
      email: donorDetails.email || '',
      amount: numericAmount,
      donationDate: donorDetails.donationDate || new Date().toISOString().split('T')[0],
      message: donorDetails.message || '',
      receiptImage: donorDetails.receiptImage || '',
      paymentMethod: donorDetails.paymentMethod || 'PhonePe / UPI QR',
      purpose: donorDetails.purpose || 'General Seva',
      paymentId,
      orderId,
      status: 'Pending',
      hasAddedToIncome: false,
      approvedAt: null,
      approvedBy: null,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return dbService.donations.add(donationRecord);
  }
};
