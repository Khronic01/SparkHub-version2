import { prisma } from '@/lib/prisma';

const PLATFORM_FEE_PERCENT = 0.05; // 5% escrow fee
const MARKETPLACE_COMMISSION_PERCENT = 0.20; // 20% marketplace commission

export interface WalletTransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Wallet Service Scaffold
 * Handles custodial wallet operations including creation, escrow, and release.
 */
export const WalletService = {
  /**
   * Create a new wallet for a user.
   * If wallet exists, returns the existing one.
   */
  async createWallet(userId: string) {
    const existing = await prisma.wallet.findUnique({ where: { userId } });
    if (existing) return existing;

    // TODO: Call external provider to generate a real crypto address
    // const address = await externalProvider.createAddress(userId);
    const mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return await prisma.wallet.create({
      data: {
        userId,
        address: mockAddress,
        balance: 1000.0, // Give 1000 mock tokens for testing purposes
        lockedBalance: 0,
      }
    });
  },

  /**
   * Create an escrow for a task.
   * Locks funds from the payer's wallet.
   */
  async createEscrow(userId: string, taskId: string, amount: number) {
    // 1. Get Payer Wallet
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      // Auto-create if doesn't exist for smoother UX in this demo
      wallet = await this.createWallet(userId);
    }

    // 2. Check Balance
    if (wallet.balance < amount) {
      throw new Error(`Insufficient funds. Balance: ${wallet.balance}, Required: ${amount}`);
    }

    // 3. Atomic Transaction: Deduct balance, increase locked, record transaction
    return await prisma.$transaction(async (tx) => {
      // Deduct from balance, add to locked
      await tx.wallet.update({
        where: { id: wallet!.id },
        data: {
          balance: { decrement: amount },
          lockedBalance: { increment: amount }
        }
      });

      // Create Transaction Record
      const transaction = await tx.cryptoTransaction.create({
        data: {
          walletId: wallet!.id,
          amount: amount,
          type: 'ESCROW_LOCK',
          status: 'COMPLETED',
          referenceId: taskId,
          description: `Escrow lock for Task ${taskId}`
        }
      });

      return transaction;
    });
  },

  /**
   * Release escrowed funds to a contributor.
   * Deducts from locked balance of payer, adds to balance of contributor (minus fee).
   */
  async releaseEscrow(taskId: string, contributorUserId: string) {
    // 1. Find the Lock Transaction to confirm amount
    const lockTx = await prisma.cryptoTransaction.findFirst({
      where: {
        referenceId: taskId,
        type: 'ESCROW_LOCK'
      }
    });

    if (!lockTx) {
      throw new Error("No active escrow found for this task.");
    }

    // Check if already released
    const existingRelease = await prisma.cryptoTransaction.findFirst({
      where: {
        referenceId: taskId,
        type: 'ESCROW_RELEASE'
      }
    });

    if (existingRelease) {
      throw new Error("Funds have already been released for this task.");
    }

    const totalAmount = lockTx.amount;
    const platformFee = totalAmount * PLATFORM_FEE_PERCENT;
    const payoutAmount = totalAmount - platformFee;

    // 2. Get Payer Wallet
    const payerWallet = await prisma.wallet.findUnique({
      where: { id: lockTx.walletId }
    });
    
    if (!payerWallet) throw new Error("Payer wallet not found.");

    // 3. Get/Create Contributor Wallet
    let contributorWallet = await prisma.wallet.findUnique({
      where: { userId: contributorUserId }
    });
    if (!contributorWallet) {
      contributorWallet = await this.createWallet(contributorUserId);
    }

    // 4. TODO: External Blockchain Transfer
    // await externalProvider.transfer(contributorWallet.address, payoutAmount);
    
    // 5. Database Update
    return await prisma.$transaction(async (tx) => {
      // Unlock funds from Payer (remove from locked)
      await tx.wallet.update({
        where: { id: payerWallet.id },
        data: { lockedBalance: { decrement: totalAmount } }
      });

      // Credit Contributor
      await tx.wallet.update({
        where: { id: contributorWallet!.id },
        data: { balance: { increment: payoutAmount } }
      });

      // Record Release Transaction
      const releaseTx = await tx.cryptoTransaction.create({
        data: {
          walletId: contributorWallet!.id,
          amount: payoutAmount,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          referenceId: taskId,
          description: `Payment received for Task ${taskId}`
        }
      });

      // Record Fee Transaction
      await tx.cryptoTransaction.create({
        data: {
          walletId: contributorWallet!.id, // Recorded against contributor as a deduction from gross? Or just a system record.
          amount: platformFee,
          type: 'FEE',
          status: 'COMPLETED',
          referenceId: taskId,
          description: `Platform fee for Task ${taskId}`
        }
      });

      return releaseTx;
    });
  },

  /**
   * Process a direct marketplace purchase.
   * Transfers funds from buyer to seller minus commission.
   */
  async processMarketplacePurchase(buyerId: string, sellerId: string, amount: number, itemId: string) {
    if (buyerId === sellerId) throw new Error("Cannot buy your own item");

    const commission = amount * MARKETPLACE_COMMISSION_PERCENT;
    const sellerPayout = amount - commission;

    // 1. Get/Create Wallets
    let buyerWallet = await prisma.wallet.findUnique({ where: { userId: buyerId } });
    if (!buyerWallet) buyerWallet = await this.createWallet(buyerId);

    let sellerWallet = await prisma.wallet.findUnique({ where: { userId: sellerId } });
    if (!sellerWallet) sellerWallet = await this.createWallet(sellerId);

    // 2. Check Buyer Balance
    if (buyerWallet.balance < amount) {
        throw new Error(`Insufficient funds. Balance: ${buyerWallet.balance} USDC`);
    }

    // 3. Atomic Transaction
    return await prisma.$transaction(async (tx) => {
        // Debit Buyer
        await tx.wallet.update({
            where: { id: buyerWallet!.id },
            data: { balance: { decrement: amount } }
        });

        // Credit Seller
        await tx.wallet.update({
            where: { id: sellerWallet!.id },
            data: { balance: { increment: sellerPayout } }
        });

        // Record Payment Transaction (Buyer Side)
        await tx.cryptoTransaction.create({
            data: {
                walletId: buyerWallet!.id,
                amount: amount,
                type: 'PAYMENT',
                status: 'COMPLETED',
                referenceId: itemId,
                description: `Purchase of item ${itemId}`
            }
        });

        // Record Receipt Transaction (Seller Side)
        await tx.cryptoTransaction.create({
            data: {
                walletId: sellerWallet!.id,
                amount: sellerPayout,
                type: 'DEPOSIT',
                status: 'COMPLETED',
                referenceId: itemId,
                description: `Sale of item ${itemId}`
            }
        });

        // Record Commission
        await tx.cryptoTransaction.create({
            data: {
                walletId: sellerWallet!.id, // or a platform wallet if we had one
                amount: commission,
                type: 'FEE',
                status: 'COMPLETED',
                referenceId: itemId,
                description: `Marketplace commission for item ${itemId}`
            }
        });
    });
  }
};
