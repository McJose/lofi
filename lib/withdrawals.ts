import { createWalletWithdrawalRequest, WALLET_MAX_WITHDRAWAL, WALLET_MIN_WITHDRAWAL } from '@/lib/wallet';

export async function requestWithdrawal(
  userId: string,
  amount: number,
  mpesaPhone: string
) {
  if (!mpesaPhone || mpesaPhone.trim().length < 9) {
    throw new Error('Valid M-Pesa phone number is required.');
  }

  return createWalletWithdrawalRequest(userId, amount, mpesaPhone);
}

export function buildDarajaB2CPayload(options: {
  amount: number;
  mpesaPhone: string;
  reference: string;
}) {
  return {
    endpoint: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
    body: {
      InitiatorName: process.env.DARAJA_INITIATOR_NAME ?? 'LofiMerchant',
      SecurityCredential: process.env.DARAJA_SECURITY_CREDENTIAL ?? '',
      CommandID: 'BusinessPayment',
      Amount: options.amount,
      PartyA: process.env.DARAJA_SHORTCODE ?? '',
      PartyB: options.mpesaPhone,
      Remarks: 'Lofi withdrawal payout',
      QueueTimeOutURL: process.env.DARAJA_TIMEOUT_URL ?? '',
      ResultURL: process.env.DARAJA_RESULT_URL ?? '',
      Occassion: 'Wallet withdrawal',
      InvoiceNumber: options.reference,
    },
  };
}

export const withdrawalRules = {
  min: WALLET_MIN_WITHDRAWAL,
  max: WALLET_MAX_WITHDRAWAL,
};