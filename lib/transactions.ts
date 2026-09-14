/**
 * BEST SALES GHANA
 * Marketplace Transaction & Revenue System
 *
 * Handles:
 * - Marketplace payments
 * - 2.15% platform revenue
 * - Automated platform-fee calculation
 * - Seller settlement
 * - 5-day settlement hold
 * - Delivery-based settlement
 * - Top Priority exception
 *
 * IMPORTANT:
 * This file does NOT connect to a payment gateway yet.
 * It prepares the financial rules for the real payment integration.
 */

/* =========================================================
   PLATFORM CONFIGURATION
========================================================= */

export const PLATFORM_CONFIG = {
  /**
   * Best Sales Ghana marketplace revenue percentage.
   */
  PLATFORM_FEE_PERCENTAGE: 2.15,

  /**
   * Seller funds can normally be released after 5 days.
   */
  DEFAULT_SETTLEMENT_HOLD_DAYS: 5,

  /**
   * Top Priority sellers do not pay the 2.15% platform
   * transaction fee because their advertising package
   * already provides the agreed platform benefit.
   */
  TOP_PRIORITY_EXEMPT_FROM_PLATFORM_FEE: true,
} as const;

/* =========================================================
   TRANSACTION TYPES
========================================================= */

export type TransactionType =
  | "MARKETPLACE_PAYMENT"
  | "DIRECT_SALE"
  | "ADVERTISING_PAYMENT"
  | "DELIVERY_PAYMENT";

export type SettlementStatus =
  | "PENDING"
  | "HELD"
  | "READY"
  | "RELEASED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REFUNDED";

/* =========================================================
   TRANSACTION RECORD
========================================================= */

export type MarketplaceTransaction = {
  id: string;

  /**
   * Seller receiving the money.
   */
  sellerId: string;

  /**
   * Customer making the payment.
   */
  customerId: string;

  /**
   * Listing/product being purchased.
   */
  listingId: string;

  /**
   * Transaction type.
   */
  type: TransactionType;

  /**
   * Original amount paid by customer.
   */
  grossAmount: number;

  /**
   * Currency used for the transaction.
   */
  currency: string;

  /**
   * Platform fee percentage.
   */
  platformFeePercentage: number;

  /**
   * Actual platform fee deducted.
   */
  platformFeeAmount: number;

  /**
   * Amount remaining for seller.
   */
  sellerAmount: number;

  /**
   * Whether seller is exempt from 2.15%.
   */
  platformFeeExempt: boolean;

  /**
   * Advertising package associated with the transaction,
   * if applicable.
   */
  advertisingPackageId: string | null;

  /**
   * Payment gateway reference.
   */
  paymentReference: string;

  /**
   * Delivery information.
   */
  deliveryRequired: boolean;

  /**
   * Delivery tracking number.
   */
  trackingNumber: string | null;

  /**
   * Delivery completion status.
   */
  deliveryCompleted: boolean;

  /**
   * When customer payment succeeded.
   */
  paidAt: Date | null;

  /**
   * When the settlement hold ends.
   */
  settlementDate: Date | null;

  /**
   * Current payment status.
   */
  paymentStatus: PaymentStatus;

  /**
   * Current settlement status.
   */
  settlementStatus: SettlementStatus;

  /**
   * Creation date.
   */
  createdAt: Date;
};

/* =========================================================
   MONEY VALIDATION
========================================================= */

function validateAmount(amount: number): void {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error("Invalid transaction amount.");
  }
}

/* =========================================================
   PLATFORM FEE CALCULATION
========================================================= */

/**
 * Calculate the normal 2.15% Best Sales Ghana
 * marketplace platform fee.
 */
export function calculatePlatformFee(
  grossAmount: number
): number {
  validateAmount(grossAmount);

  const fee =
    grossAmount *
    (PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE / 100);

  return roundMoney(fee);
}

/* =========================================================
   SELLER AMOUNT
========================================================= */

/**
 * Calculate the amount the seller receives after
 * the Best Sales Ghana platform fee.
 */
export function calculateSellerAmount(
  grossAmount: number,
  platformFeeExempt = false
): number {
  validateAmount(grossAmount);

  if (platformFeeExempt) {
    return roundMoney(grossAmount);
  }

  const platformFee =
    calculatePlatformFee(grossAmount);

  return roundMoney(
    grossAmount - platformFee
  );
}

/* =========================================================
   TOP PRIORITY EXCEPTION
========================================================= */

/**
 * Determine whether a seller should be exempt from
 * the 2.15% marketplace platform fee.
 *
 * Top Priority = exempt.
 */
export function isPlatformFeeExempt(
  advertisingPackageId: string | null
): boolean {
  return (
    PLATFORM_CONFIG.TOP_PRIORITY_EXEMPT_FROM_PLATFORM_FEE &&
    advertisingPackageId === "top-priority"
  );
}

/* =========================================================
   COMPLETE PAYMENT CALCULATION
========================================================= */

export function calculateTransactionAmounts({
  grossAmount,
  advertisingPackageId = null,
}: {
  grossAmount: number;
  advertisingPackageId?: string | null;
}) {
  validateAmount(grossAmount);

  const platformFeeExempt =
    isPlatformFeeExempt(
      advertisingPackageId
    );

  const platformFeePercentage =
    platformFeeExempt
      ? 0
      : PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE;

  const platformFeeAmount =
    platformFeeExempt
      ? 0
      : calculatePlatformFee(grossAmount);

  const sellerAmount =
    calculateSellerAmount(
      grossAmount,
      platformFeeExempt
    );

  return {
    grossAmount: roundMoney(grossAmount),
    platformFeePercentage,
    platformFeeAmount,
    sellerAmount,
    platformFeeExempt,
  };
}

/* =========================================================
   SETTLEMENT DATE
========================================================= */

/**
 * Calculate the normal settlement date.
 *
 * Example:
 * Payment successful Monday
 * Settlement becomes available Saturday.
 */
export function calculateSettlementDate(
  paidAt: Date,
  holdDays: number =
    PLATFORM_CONFIG.DEFAULT_SETTLEMENT_HOLD_DAYS
): Date {
  if (
    !(paidAt instanceof Date) ||
    Number.isNaN(paidAt.getTime())
  ) {
    throw new Error("Invalid payment date.");
  }

  if (
    !Number.isInteger(holdDays) ||
    holdDays < 0
  ) {
    throw new Error("Invalid settlement hold period.");
  }

  const settlementDate =
    new Date(paidAt);

  settlementDate.setDate(
    settlementDate.getDate() + holdDays
  );

  return settlementDate;
}

/* =========================================================
   TRANSACTION REFERENCE
========================================================= */

export function createTransactionReference(): string {
  const timestamp = Date.now();

  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

  return `BSG-TXN-${timestamp}-${randomPart}`;
}

/* =========================================================
   TRACKING NUMBER
========================================================= */

export function createTrackingNumber(): string {
  const timestamp = Date.now();

  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return `BSG-${timestamp}-${randomPart}`;
}

/* =========================================================
   TRANSACTION ID
========================================================= */

export function createTransactionId(): string {
  const timestamp = Date.now();

  const randomPart =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return `BSG-TRX-${timestamp}-${randomPart}`;
}

/* =========================================================
   CREATE TRANSACTION
========================================================= */

export function createMarketplaceTransaction({
  sellerId,
  customerId,
  listingId,
  grossAmount,
  currency = "GHS",
  advertisingPackageId = null,
  deliveryRequired = false,
}: {
  sellerId: string;
  customerId: string;
  listingId: string;
  grossAmount: number;
  currency?: string;
  advertisingPackageId?: string | null;
  deliveryRequired?: boolean;
}): MarketplaceTransaction {
  if (!sellerId.trim()) {
    throw new Error("Seller ID is required.");
  }

  if (!customerId.trim()) {
    throw new Error("Customer ID is required.");
  }

  if (!listingId.trim()) {
    throw new Error("Listing ID is required.");
  }

  validateAmount(grossAmount);

  const amounts =
    calculateTransactionAmounts({
      grossAmount,
      advertisingPackageId,
    });

  return {
    id: createTransactionId(),

    sellerId,

    customerId,

    listingId,

    type: "MARKETPLACE_PAYMENT",

    grossAmount:
      amounts.grossAmount,

    currency,

    platformFeePercentage:
      amounts.platformFeePercentage,

    platformFeeAmount:
      amounts.platformFeeAmount,

    sellerAmount:
      amounts.sellerAmount,

    platformFeeExempt:
      amounts.platformFeeExempt,

    advertisingPackageId,

    paymentReference:
      createTransactionReference(),

    deliveryRequired,

    trackingNumber:
      deliveryRequired
        ? createTrackingNumber()
        : null,

    deliveryCompleted: false,

    paidAt: null,

    settlementDate: null,

    paymentStatus: "PENDING",

    settlementStatus: "PENDING",

    createdAt: new Date(),
  };
}

/* =========================================================
   MARK PAYMENT SUCCESSFUL
========================================================= */

/**
 * Call this after the payment gateway confirms
 * a successful payment.
 */
export function markPaymentSuccessful(
  transaction: MarketplaceTransaction,
  paidAt: Date = new Date()
): MarketplaceTransaction {
  if (
    !(paidAt instanceof Date) ||
    Number.isNaN(paidAt.getTime())
  ) {
    throw new Error("Invalid payment date.");
  }

  const settlementDate =
    calculateSettlementDate(paidAt);

  return {
    ...transaction,

    paymentStatus: "SUCCESSFUL",

    paidAt,

    settlementDate,

    settlementStatus: "HELD",
  };
}

/* =========================================================
   DELIVERY COMPLETED
========================================================= */

/**
 * Mark an order as successfully delivered.
 *
 * For delivered orders, seller funds can become
 * eligible for release immediately.
 */
export function markDeliveryCompleted(
  transaction: MarketplaceTransaction
): MarketplaceTransaction {
  if (
    transaction.paymentStatus !==
    "SUCCESSFUL"
  ) {
    throw new Error(
      "Payment must be successful before delivery can be completed."
    );
  }

  return {
    ...transaction,

    deliveryCompleted: true,

    settlementStatus: "READY",
  };
}

/* =========================================================
   CHECK SETTLEMENT
========================================================= */

/**
 * Determines whether seller funds can be released.
 *
 * Rules:
 *
 * 1. Payment must be successful.
 * 2. If delivery is required, delivery must be completed.
 * 3. OR the normal 5-day hold must have passed.
 */
export function isSettlementReady(
  transaction: MarketplaceTransaction,
  now: Date = new Date()
): boolean {
  if (
    transaction.paymentStatus !==
    "SUCCESSFUL"
  ) {
    return false;
  }

  if (
    transaction.settlementStatus ===
    "RELEASED"
  ) {
    return false;
  }

  /**
   * Successful delivery can make the funds
   * immediately eligible for release.
   */
  if (
    transaction.deliveryRequired &&
    transaction.deliveryCompleted
  ) {
    return true;
  }

  /**
   * If delivery is not completed, the normal
   * 5-day settlement period applies.
   */
  if (
    transaction.settlementDate &&
    now.getTime() >=
      transaction.settlementDate.getTime()
  ) {
    return true;
  }

  return false;
}

/* =========================================================
   UPDATE SETTLEMENT STATUS
========================================================= */

export function updateSettlementStatus(
  transaction: MarketplaceTransaction,
  now: Date = new Date()
): MarketplaceTransaction {
  if (
    isSettlementReady(
      transaction,
      now
    )
  ) {
    return {
      ...transaction,
      settlementStatus: "READY",
    };
  }

  return transaction;
}

/* =========================================================
   RELEASE SELLER FUNDS
========================================================= */

/**
 * Mark seller funds as released.
 *
 * The actual bank/mobile-money transfer will be
 * handled by the payment gateway integration later.
 */
export function releaseSellerFunds(
  transaction: MarketplaceTransaction,
  now: Date = new Date()
): MarketplaceTransaction {
  if (
    !isSettlementReady(
      transaction,
      now
    )
  ) {
    throw new Error(
      "Seller funds are not ready for release."
    );
  }

  return {
    ...transaction,

    settlementStatus: "RELEASED",
  };
}

/* =========================================================
   REFUND
========================================================= */

export function refundTransaction(
  transaction: MarketplaceTransaction
): MarketplaceTransaction {
  if (
    transaction.paymentStatus ===
    "REFUNDED"
  ) {
    return transaction;
  }

  return {
    ...transaction,

    paymentStatus: "REFUNDED",

    settlementStatus: "REFUNDED",
  };
}

/* =========================================================
   CANCEL TRANSACTION
========================================================= */

export function cancelTransaction(
  transaction: MarketplaceTransaction
): MarketplaceTransaction {
  if (
    transaction.paymentStatus ===
    "SUCCESSFUL"
  ) {
    throw new Error(
      "A successful payment cannot be cancelled directly. Use the refund process."
    );
  }

  return {
    ...transaction,

    paymentStatus: "FAILED",

    settlementStatus: "CANCELLED",
  };
}

/* =========================================================
   MONEY ROUNDING
========================================================= */

export function roundMoney(
  amount: number
): number {
  return Math.round(
    (amount + Number.EPSILON) * 100
  ) / 100;
}

/* =========================================================
   PLATFORM REVENUE
========================================================= */

/**
 * Returns the platform revenue earned from
 * a transaction.
 */
export function getPlatformRevenue(
  transaction: MarketplaceTransaction
): number {
  if (
    transaction.platformFeeExempt
  ) {
    return 0;
  }

  return roundMoney(
    transaction.platformFeeAmount
  );
}

/* =========================================================
   SELLER SETTLEMENT SUMMARY
========================================================= */

export function getSettlementSummary(
  transaction: MarketplaceTransaction
) {
  return {
    transactionId:
      transaction.id,

    grossAmount:
      transaction.grossAmount,

    currency:
      transaction.currency,

    platformFeePercentage:
      transaction.platformFeePercentage,

    platformFee:
      transaction.platformFeeAmount,

    sellerAmount:
      transaction.sellerAmount,

    platformFeeExempt:
      transaction.platformFeeExempt,

    deliveryRequired:
      transaction.deliveryRequired,

    deliveryCompleted:
      transaction.deliveryCompleted,

    trackingNumber:
      transaction.trackingNumber,

    settlementDate:
      transaction.settlementDate,

    settlementStatus:
      transaction.settlementStatus,
  };
}
