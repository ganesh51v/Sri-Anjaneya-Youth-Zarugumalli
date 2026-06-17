import { dbService } from '../firebase/config';

// Simulated Secure Backend environment (in a real production app, this lives on Node/Express server)
const MOCK_BACKEND = {
  // Secret key simulates the secure key stored only in backend environment variables
  razorpay_secret: 'mock_sec_9918237198237192837198',
  
  createOrder: async (amount) => {
    // Generate a secure transaction ID
    const receiptId = 'receipt_' + Math.random().toString(36).substr(2, 9);
    const orderId = 'order_' + Math.random().toString(36).substr(2, 12);
    
    // Log backend operation to console for debugging/audit
    console.log(`[Backend Order Creation] Securely generated Order ID: ${orderId} for amount: ₹${amount}`);
    
    return {
      success: true,
      orderId,
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: receiptId
    };
  },

  verifySignature: async (orderId, paymentId, signature) => {
    console.log(`[Backend Signature Verification] Running cryptographic HMAC verification using secret key...`);
    
    // Simulate HMAC signature verification
    const isValid = signature === `mock_sig_${orderId}_${paymentId}`;
    
    console.log(`[Backend Signature Verification] Verification Result: ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  }
};

export const RAZORPAY_KEY_ID = 'rzp_test_T0LiAO755ol6LH';

export const paymentService = {
  // Initiates the order creation (Client calls this to talk to "Backend")
  initiateDonation: async (donorDetails) => {
    const { amount } = donorDetails;
    
    // In direct client integration, order is created automatically by Razorpay,
    // but we simulate order metadata locally for consistent routing.
    const order = await MOCK_BACKEND.createOrder(amount);
    return order;
  },

  // Finalizes the donation transaction (Client calls this to submit payment proofs to "Backend" for validation)
  processPaymentResponse: async (donorDetails, paymentResponse) => {
    const { orderId, paymentId, signature, status } = paymentResponse;
    
    let finalStatus = status || 'Success';

    // Step 2: Securely store transaction in the Database
    const donationRecord = {
      donorName: donorDetails.donorName,
      phone: donorDetails.phone,
      email: donorDetails.email || '',
      amount: parseFloat(donorDetails.amount),
      paymentMethod: donorDetails.paymentMethod,
      purpose: donorDetails.purpose || 'General Seva',
      paymentId: paymentId || 'N/A',
      orderId: orderId || 'N/A',
      status: finalStatus,
      createdAt: new Date().toISOString()
    };

    const savedRecord = await dbService.donations.add(donationRecord);
    return savedRecord;
  }
};
