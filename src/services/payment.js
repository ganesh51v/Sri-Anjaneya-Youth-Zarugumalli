import { dbService } from '../firebase/config';

const postPaymentRequest = async (path, body) => {
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
      userId: donorDetails.userId,
      donorName: donorDetails.donorName,
      phone: donorDetails.phone,
      email: donorDetails.email || '',
      amount: Number(donorDetails.amount),
      paymentMethod: donorDetails.paymentMethod,
      purpose: donorDetails.purpose || 'General Seva',
      paymentId: paymentResponse.paymentId,
      orderId: paymentResponse.orderId,
      status: 'Success',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return dbService.donations.add(donationRecord);
  }
};
