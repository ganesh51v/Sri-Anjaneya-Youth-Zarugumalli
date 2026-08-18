/**
 * emailService.js
 * Client-side helper for triggering email dispatches via the backend /api/send-email endpoint
 * powered by Resend Node.js SDK.
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '';
  }
  return 'https://sri-anjaneya-youth-zarugumalli.vercel.app';
};

export const emailService = {
  /**
   * Generic send email method
   */
  async sendEmail({ type, to, subject, data, idempotencyKey }) {
    if (!to) {
      console.warn('[emailService] No recipient email specified.');
      return { success: false, error: 'Recipient address missing' };
    }

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          to,
          subject,
          data,
          idempotencyKey
        })
      });

      if (res.ok) {
        const result = await res.json();
        console.log(`[emailService] ${type} email dispatch result:`, result);
        return result;
      } else {
        const errText = await res.text();
        console.warn(`[emailService] Server returned error ${res.status}:`, errText);
        return { success: false, error: errText };
      }
    } catch (err) {
      console.error('[emailService] Network error sending email:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Send Welcome Email
   */
  async sendWelcome(user) {
    return this.sendEmail({
      type: 'welcome',
      to: user.email,
      subject: '🙏 Welcome to Sri Anjaneya Youth Association, Zarugumalli!',
      data: { name: user.name },
      idempotencyKey: `welcome-user/${user.id || user.email}`
    });
  },

  /**
   * Send Donation Receipt Email
   */
  async sendDonationReceipt(donation) {
    return this.sendEmail({
      type: 'donation',
      to: donation.email,
      subject: `🙏 Donation Receipt: ₹${donation.amount} - Sri Anjaneya Youth`,
      data: {
        donorName: donation.donorName,
        amount: donation.amount,
        paymentId: donation.paymentId || donation.id,
        purpose: donation.purpose,
        date: donation.date || new Date().toLocaleDateString('en-IN')
      },
      idempotencyKey: `donation-receipt/${donation.paymentId || donation.id || Date.now()}`
    });
  },

  /**
   * Send Announcement Notification Email to member(s)
   */
  async sendAnnouncement(announcement, recipients) {
    return this.sendEmail({
      type: 'announcement',
      to: recipients,
      subject: `📢 Announcement: ${announcement.title}`,
      data: {
        title: announcement.title,
        message: announcement.message,
        date: new Date().toLocaleDateString('en-IN')
      },
      idempotencyKey: `announcement-notify/${announcement.id || Date.now()}`
    });
  },

  /**
   * Send Event Notification / Reminder Email to member(s)
   */
  async sendEvent(event, recipients) {
    return this.sendEmail({
      type: 'event',
      to: recipients,
      subject: `📅 Event Notification: ${event.title}`,
      data: {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        description: event.description
      },
      idempotencyKey: `event-notify/${event.id || Date.now()}`
    });
  },

  /**
   * Send OTP / Verification Email
   */
  async sendOtp(email, code) {
    return this.sendEmail({
      type: 'otp',
      to: email,
      subject: `🔐 Verification Code: ${code} - Sri Anjaneya Youth`,
      data: { code },
      idempotencyKey: `otp-user/${email}/${Date.now()}`
    });
  }
};

export const smsService = {
  /**
   * Send SMS OTP via Twilio API endpoint
   */
  async sendTwilioOtp(phone, code) {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/send-twilio-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      if (res.ok) {
        const result = await res.json();
        console.log('[smsService] Twilio OTP dispatch result:', result);
        return result;
      } else {
        const errText = await res.text();
        console.warn('[smsService] Twilio API error:', errText);
        return { success: false, error: errText };
      }
    } catch (err) {
      console.error('[smsService] Twilio network error:', err);
      return { success: false, error: err.message };
    }
  }
};
