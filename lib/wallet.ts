import { prisma } from '@/lib/prisma';

export const WALLET_MIN_WITHDRAWAL = 100;
export const WALLET_MAX_WITHDRAWAL = 50000;
export const PLATFORM_REVENUE_USER_ID =
  process.env.PLATFORM_REVENUE_USER_ID ?? 'platform-revenue';

export async function createWalletForUser(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    create: {
      userId,
      currentBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      lifetimeWithdrawals: 0,
      totalRecoveries: 0,
      totalPlatformFees: 0,
    },
    update: {},
  });
}

export async function getUserWallet(userId: string) {
  return createWalletForUser(userId);
}

export async function getWalletDashboard(userId: string) {
  const wallet = await getUserWallet(userId);

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId, walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });

  const withdrawals = await prisma.walletWithdrawal.findMany({
    where: { userId },
    orderBy: { initiatedAt: 'desc' },
    take: 6,
  });

  return { wallet, transactions, withdrawals };
}

export async function getOrCreatePlatformWallet() {
  return prisma.wallet.upsert({
    where: { userId: PLATFORM_REVENUE_USER_ID },
    create: {
      userId: PLATFORM_REVENUE_USER_ID,
      currentBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      lifetimeWithdrawals: 0,
      totalRecoveries: 0,
      totalPlatformFees: 0,
    },
    update: {},
  });
}

export async function getPlatformRevenueSummary() {
  const now = new Date();
  const dailyStart = new Date(now);
  dailyStart.setHours(0, 0, 0, 0);

  const weeklyStart = new Date(dailyStart);
  weeklyStart.setDate(weeklyStart.getDate() - 7);

  const monthlyStart = new Date(dailyStart);
  monthlyStart.setDate(monthlyStart.getDate() - 30);

  const platformEarnings = await prisma.walletTransaction.aggregate({
    where: { type: 'PLATFORM_COMMISSION', status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const finderEarnings = await prisma.walletTransaction.aggregate({
    where: { type: 'RECOVERY_PAYMENT', status: 'COMPLETED' },
    _sum: { amount: true },
  });

  const dailyRevenue = await prisma.walletTransaction.aggregate({
    where: {
      type: 'PLATFORM_COMMISSION',
      status: 'COMPLETED',
      createdAt: { gte: dailyStart },
    },
    _sum: { amount: true },
  });

  const weeklyRevenue = await prisma.walletTransaction.aggregate({
    where: {
      type: 'PLATFORM_COMMISSION',
      status: 'COMPLETED',
      createdAt: { gte: weeklyStart },
    },
    _sum: { amount: true },
  });

  const monthlyRevenue = await prisma.walletTransaction.aggregate({
    where: {
      type: 'PLATFORM_COMMISSION',
      status: 'COMPLETED',
      createdAt: { gte: monthlyStart },
    },
    _sum: { amount: true },
  });

  const walletTotals = await prisma.wallet.aggregate({
    _sum: {
      currentBalance: true,
      availableBalance: true,
      pendingBalance: true,
      lifetimeWithdrawals: true,
      totalPlatformFees: true,
    },
  });

  const pendingWithdrawals = await prisma.walletWithdrawal.count({
    where: { status: 'PENDING' },
  });

  const completedWithdrawals = await prisma.walletWithdrawal.count({
    where: { status: 'COMPLETED' },
  });

  const failedWithdrawals = await prisma.walletWithdrawal.count({
    where: { status: 'FAILED' },
  });

  const totalRevenue = Number(platformEarnings._sum.amount ?? 0);

  return {
    platformEarnings: Number(platformEarnings._sum.amount ?? 0),
    dailyRevenue: Number(dailyRevenue._sum.amount ?? 0),
    weeklyRevenue: Number(weeklyRevenue._sum.amount ?? 0),
    monthlyRevenue: Number(monthlyRevenue._sum.amount ?? 0),
    totalRevenue,
    pendingWithdrawals,
    completedWithdrawals,
    failedWithdrawals,
    totalWalletBalances: Number(walletTotals._sum.currentBalance ?? 0),
    totalAvailableBalance: Number(walletTotals._sum.availableBalance ?? 0),
    totalPendingBalance: Number(walletTotals._sum.pendingBalance ?? 0),
    finderEarnings: Number(finderEarnings._sum.amount ?? 0),
  };
}

export async function createWalletWithdrawalRequest(
  userId: string,
  amount: number,
  mpesaPhone: string
) {
  const wallet = await getUserWallet(userId);

  if (amount < WALLET_MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal amount is ${WALLET_MIN_WITHDRAWAL}`);
  }

  if (amount > WALLET_MAX_WITHDRAWAL) {
    throw new Error(`Maximum withdrawal amount is ${WALLET_MAX_WITHDRAWAL}`);
  }

  if (Number(wallet.availableBalance) < amount) {
    throw new Error('Insufficient available balance');
  }

  const withdrawal = await prisma.walletWithdrawal.create({
    data: {
      walletId: wallet.id,
      userId,
      amount,
      status: 'PENDING',
      externalReference: `MPESA-${Date.now()}`,
      note: `Withdrawal request to ${mpesaPhone}`,
    },
  });

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      availableBalance: { decrement: amount },
      pendingBalance: { increment: amount },
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      amount,
      commission: 0,
      netEarnings: -amount,
      reference: withdrawal.externalReference,
    },
  });

  return withdrawal;
}

export async function getTransactionHistory(userId: string, query = '') {
  return prisma.walletTransaction.findMany({
    where: {
      userId,
      OR: [
        { reference: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}