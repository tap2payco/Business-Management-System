/**
 * BeemOTP Integration Utility
 * 
 * Provides functions to send and verify OTP codes via Beem Africa's OTP API
 */

import axios from 'axios';

const BEEM_OTP_BASE_URL = 'https://apiotp.beem.africa/v1';
const BEEM_API_KEY = process.env.BEEM_API_KEY || '';
const BEEM_SECRET_KEY = process.env.BEEM_SECRET_KEY || '';
const BEEM_APP_ID = process.env.BEEM_APP_ID || '1';

interface BeemOTPRequestResponse {
  data: {
    pinId: string;
    message: {
      code: number;
      message: string;
    };
  };
}

interface BeemOTPVerifyResponse {
  data: {
    message: {
      code: number;
      message: string;
    };
  };
}

/**
 * Send OTP to a phone number
 * @param phoneNumber - Phone number in international format without + (e.g., 255784825785)
 * @returns pinId to use for verification
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; pinId?: string; error?: string }> {
  try {
    // Validate phone number format (should be digits only, starting with country code)
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      return { success: false, error: 'Invalid phone number format. Use international format without +' };
    }

    const response = await axios.post<BeemOTPRequestResponse>(
      `${BEEM_OTP_BASE_URL}/request`,
      {
        appId: parseInt(BEEM_APP_ID),
        msisdn: phoneNumber
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString('base64')}`
        }
      }
    );

    if (response.data?.data?.pinId) {
      return {
        success: true,
        pinId: response.data.data.pinId
      };
    }

    return {
      success: false,
      error: response.data?.data?.message?.message || 'Failed to send OTP'
    };

  } catch (error: any) {
    console.error('BeemOTP send error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.data?.message?.message || 'Failed to send OTP'
    };
  }
}

/**
 * Verify OTP code
 * @param pinId - PIN ID received from sendOTP
 * @param pin - OTP code entered by user
 * @returns verification result
 */
export async function verifyOTP(pinId: string, pin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await axios.post<BeemOTPVerifyResponse>(
      `${BEEM_OTP_BASE_URL}/verify`,
      {
        pinId,
        pin
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString('base64')}`
        }
      }
    );

    const code = response.data?.data?.message?.code;
    
    // Code 117 = Valid Pin
    if (code === 117) {
      return { success: true };
    }

    // Handle specific error codes
    const errorMessages: Record<number, string> = {
      114: 'Incorrect PIN',
      115: 'PIN expired',
      116: 'Too many attempts',
      118: 'PIN already used',
      113: 'Invalid PIN ID'
    };

    return {
      success: false,
      error: errorMessages[code] || response.data?.data?.message?.message || 'Invalid PIN'
    };

  } catch (error: any) {
    console.error('BeemOTP verify error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.data?.message?.message || 'Failed to verify OTP'
    };
  }
}

/**
 * Format phone number to BeemOTP format (remove + and spaces)
 * @param phone - Phone number in any format
 * @returns Formatted phone number
 */
export function formatPhoneForBeem(phone: string): string {
  return phone.replace(/[\s+()-]/g, '');
}
