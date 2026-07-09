import fs from 'fs/promises';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'wallet-store.json');

type Wallet = {
  id: string;
  userId: string;
  currentBalance: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  lifetimeWithdrawals: number;
  totalRecoveries: number;
  totalPlatformFees: number;
};

type WalletTransaction = {
  id: string;
  walletId: string;
  userId: string;
  recoveryId?: string;
  type: 'RECOVERY_PAYMENT' | 'PLATFORM_COMMISSION' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  commission: number;
  netEarnings: number;
  reference: string;
  createdAt: string;
};

type WalletWithdrawal = {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  initiatedAt: string;
  completedAt?: string;
  externalReference: string;
  note?: string;
};

type WalletStore = {
  wallets: Wallet[];
  transactions: WalletTransaction[];
  withdrawals: WalletWithdrawal[];
};

const INITIAL_STORE: WalletStore = {
  wallets: [],
  transactions: [],
  withdrawals: [],
};

const WALLET_MIN_WITHDRAWAL = 100;
const WALLET_MAX_WITHDRAWAL = 50000;
const PLATFORM_REVENUE_USER_ID =
  process.env.PLATFORM_REVENUE_USER_ID ?? 'platform-revenue';

async function ensureStore(): Promise<WalletStore> {
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(INITIAL_STORE, null, 2), 'utf8');
  }

  const content = await fs.readFile(STORE_PATH, 'utf8');
  return JSON.parse(content) as WalletStore;
}

async function saveStore(store: WalletStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

export async function createWalletForUser(userId: string) {
  const store = await ensureStore();
  let wallet = store.wallets.find((record) => record.userId === userId);

  if (!wallet) {
    wallet = {
      id: generateId('wallet'),
      userId,
      currentBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      lifetimeWithdrawals: 0,
      totalRecoveries: 0,
      totalPlatformFees: 0,
    };
    store.wallets.push(wallet);
    await saveStore(store);
  }

  return wallet;
}

export async function getUserWallet(userId: string) {
  return createWalletForUser(userId);
}

export async function getWalletDashboard(userId: string) {
  const wallet = await getUserWallet(userId);
  const store = await ensureStore();

  const transactions = store.transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  const withdrawals = store.withdrawals
    .filter((withdrawal) => withdrawal.userId === userId)
    .sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime())
    .slice(0, 6);

  return { wallet, transactions, withdrawals };
}

export async function getOrCreatePlatformWallet() {
  return createWalletForUser(PLATFORM_REVENUE_USER_ID);
}

export async function getPlatformRevenueSummary() {
  const store = await ensureStore();
  const now = new Date();
  const dailyStart = new Date(now);
  dailyStart.setHours(0, 0, 0, 0);

  const weeklyStart = new Date(dailyStart);
  weeklyStart.setDate(weeklyStart.getDate() - 7);

  const monthlyStart = new Date(dailyStart);
  monthlyStart.setDate(monthlyStart.getDate() - 30);

  const completedCommissions = store.transactions.filter(
    (transaction) => transaction.type === 'PLATFORM_COMMISSION' && transaction.status === 'COMPLETED'
  );
  const completedEarnings = store.transactions.filter(
    (transaction) => transaction.type === 'RECOVERY_PAYMENT' && transaction.status === 'COMPLETED'
  );

  const sum = (items: WalletTransaction[]) =>
    items.reduce((total, item) => total + item.amount, 0);

  const walletTotals = store.wallets.reduce(
    (totals, wallet) => ({
      currentBalance: totals.currentBalance + wallet.currentBalance,
      availableBalance: totals.availableBalance + wallet.availableBalance,
      pendingBalance: totals.pendingBalance + wallet.pendingBalance,
      lifetimeWithdrawals: totals.lifetimeWithdrawals + wallet.lifetimeWithdrawals,
      totalPlatformFees: totals.totalPlatformFees + wallet.totalPlatformFees,
    }),
    {
      currentBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeWithdrawals: 0,
      totalPlatformFees: 0,
    }
  );

  const countStatus = (type: 'PENDING' | 'COMPLETED' | 'FAILED') =>
    store.withdrawals.filter((withdrawal) => withdrawal.status === type).length;

  const filterDate = (start: Date) =>
    store.transactions.filter(
      (transaction) =>
        transaction.type === 'PLATFORM_COMMISSION' &&
        transaction.status === 'COMPLETED' &&
        new Date(transaction.createdAt) >= start
    );

  return {
    platformEarnings: sum(completedCommissions),
    dailyRevenue: sum(filterDate(dailyStart)),
    weeklyRevenue: sum(filterDate(weeklyStart)),
    monthlyRevenue: sum(filterDate(monthlyStart)),
    totalRevenue: sum(completedCommissions),
    pendingWithdrawals: countStatus('PENDING'),
    completedWithdrawals: countStatus('COMPLETED'),
    failedWithdrawals: countStatus('FAILED'),
    totalWalletBalances: walletTotals.currentBalance,
    totalAvailableBalance: walletTotals.availableBalance,
    totalPendingBalance: walletTotals.pendingBalance,
    finderEarnings: sum(completedEarnings),
  };
}

export async function createWalletWithdrawalRequest(
  userId: string,
  amount: number,
  mpesaPhone: string
) {
  if (amount < WALLET_MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal amount is ${WALLET_MIN_WITHDRAWAL}`);
  }

  if (amount > WALLET_MAX_WITHDRAWAL) {
    throw new Error(`Maximum withdrawal amount is ${WALLET_MAX_WITHDRAWAL}`);
  }

  const store = await ensureStore();
  const wallet = await getUserWallet(userId);

  if (wallet.availableBalance < amount) {
    throw new Error('Insufficient available balance');
  }

  wallet.availableBalance -= amount;
  wallet.pendingBalance += amount;

  const withdrawal: WalletWithdrawal = {
    id: generateId('withdrawal'),
    walletId: wallet.id,
    userId,
    amount,
    status: 'PENDING',
    initiatedAt: new Date().toISOString(),
    externalReference: `MPESA-${Date.now()}`,
    note: `Withdrawal request to ${mpesaPhone}`,
  };

  store.withdrawals.unshift(withdrawal);

  store.transactions.unshift({
    id: generateId('txn'),
    walletId: wallet.id,
    userId,
    type: 'WITHDRAWAL',
    status: 'PENDING',
    amount,
    commission: 0,
    netEarnings: -amount,
    reference: withdrawal.externalReference,
    createdAt: new Date().toISOString(),
  });

  await saveStore(store);

  return withdrawal;
}

export async function getTransactionHistory(userId: string, query = '') {
  const store = await ensureStore();
  return store.transactions
    .filter(
      (transaction) =>
        transaction.userId === userId &&
        (transaction.reference.toLowerCase().includes(query.toLowerCase()) ||
          transaction.type.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
}

export {
  WALLET_MIN_WITHDRAWAL,
  WALLET_MAX_WITHDRAWAL,
  PLATFORM_REVENUE_USER_ID,
};