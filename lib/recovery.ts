import { applyRecoveryPayment } from '@/lib/wallet';

interface DistributeRecoveryPayload {
  ownerId: string;
  finderId: string;
  amount: number;
  recoveryId?: string;
}

export async function distributeRecoveryPayment(payload: DistributeRecoveryPayload) {
  return applyRecoveryPayment(payload);
}
