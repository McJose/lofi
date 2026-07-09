import { prisma } from '@/lib/prisma';
import { getOrCreatePlatformWallet, getUserWallet } from '@/lib/wallet';

interface DistributeRecoveryPayload {
  ownerId: string;
  finderId: string;
  amount: number;
  recoveryId?: string;
}

export async function distributeRecoveryPayment(payload: DistributeRecoveryPayload) {
  const { ownerId, finderId, amount, recoveryId } = payload;
  const finderWallet = await getUserWallet(finderId);
  const platformWallet = await getOrCreatePlatformWallet();

  const platformCommission = Number((amount * 0.2).toFixed(2));
  const finderShare = Number((amount * 0.8).toFixed(2));
  const referenceBase = recoveryId ?? `RECOVERY-${Date.now()}`;

  await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: finderWallet.id,
        userId: finderId,
        recoveryId,
        type: 'RECOVERY_PAYMENT',
        status: 'COMPLETED',
        amount: finderShare,
        commission: 0,
        netEarnings: finderShare,
        reference: `${referenceBase}-FINDER`,
      },
    }),
    prisma.wallet.update({
      where: { id: finderWallet.id },
      data: {
        currentBalance: { increment: finderShare },
        availableBalance: { increment: finderShare },
        lifetimeEarnings: { increment: finderShare },
        totalRecoveries: { increment: 1 },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: platformWallet.id,
        userId: platformWallet.userId,
        recoveryId,
        type: 'PLATFORM_COMMISSION',
        status: 'COMPLETED',
        amount: platformCommission,
        commission: 0,
        netEarnings: platformCommission,
        reference: `${referenceBase}-PLATFORM`,
      },
    }),
    prisma.wallet.update({
      where: { id: platformWallet.id },
      data: {
        currentBalance: { increment: platformCommission },
        availableBalance: { increment: platformCommission },
        totalPlatformFees: { increment: platformCommission },
      },
    }),
  ]);

  return {
    finderShare,
    platformCommission,
    recoveryId,
    ownerId,
    finderId,
  };
}
