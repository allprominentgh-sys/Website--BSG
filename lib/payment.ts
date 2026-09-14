// lib/payments.ts

/**
 * BEST SALES GHANA
 * Marketplace Payment & Revenue Foundation
 *
 * Platform fee:
 * 2.15%
 *
 * Settlement:
 * After successful delivery + 5-day settlement hold.
 */

export const DEFAULT_PLATFORM_FEE_PERCENT = 2.15;

export const SETTLEMENT_HOLD_DAYS = 5;

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "DISPUTED";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type SettlementStatus =
  | "NOT_ELIGIBLE"
  | "PENDING_DELIVERY"
  | "SETTLEMENT_PENDING"
  | "READY_FOR_PAYOUT"
  | "PAID_OUT"
  | "ON_HOLD";

export type PaymentCalculation = {
  grossAmount: number;
  platformFeePercent: number;
  platformFee: number;
  sellerAmount: number;
  currency: string;
};

/**
 * Calculate the 2.15% marketplace platform fee.
 */
export function calculatePlatformFee(
  amount: number,
  platformFeePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid payment amount.");
  }

  if (
    !Number.isFinite(platformFeePercent) ||
    platformFeePercent < 0 ||
    platformFeePercent > 100
  ) {
    throw new Error("Invalid platform fee percentage.");
  }

  const fee = (amount * platformFeePercent) / 100;

  return roundMoney(fee);
}

/**
 * Calculate the seller's balance after the platform fee.
 */
export function calculateSellerAmount(
  amount: number,
  platformFeePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
): number {
  const platformFee = calculatePlatformFee(
    amount,
    platformFeePercent
  );

  return roundMoney(amount - platformFee);
}

/**
 * Complete payment calculation.
 */
export function calculatePayment(
  amount: number,
  currency: string = "GHS",
  platformFeePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
): PaymentCalculation {
  const platformFee = calculatePlatformFee(
    amount,
    platformFeePercent
  );

  const sellerAmount = roundMoney(amount - platformFee);

  return {
    grossAmount: roundMoney(amount),
    platformFeePercent,
    platformFee,
    sellerAmount,
    currency,
  };
}

/**
 * Round money to two decimal places.
 */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate the date when a seller becomes eligible
 * for settlement after successful delivery.
 *
 * Example:
 * Delivered: 10 September
 * Settlement eligible: 15 September
 */
export function calculateSettlementDate(
  deliveredAt: Date,
  holdDays: number = SETTLEMENT_HOLD_DAYS
): Date {
  if (!(deliveredAt instanceof Date) || Number.isNaN(deliveredAt.getTime())) {
    throw new Error("Invalid delivery date.");
  }

  if (!Number.isInteger(holdDays) || holdDays < 0) {
    throw new Error("Invalid settlement hold period.");
  }

  const settlementDate = new Date(deliveredAt);

  settlementDate.setDate(
    settlementDate.getDate() + holdDays
  );

  return settlementDate;
}

/**
 * Determine whether a seller's funds are ready
 * for payout.
 */
export function isSettlementReady(
  deliveredAt: Date | null,
  now: Date = new Date(),
  holdDays: number = SETTLEMENT_HOLD_DAYS
): boolean {
  if (!deliveredAt) {
    return false;
  }

  const settlementDate = calculateSettlementDate(
    deliveredAt,
    holdDays
  );

  return now.getTime() >= settlementDate.getTime();
}

/**
 * Determine the settlement status of an order.
 */
export function getSettlementStatus({
  orderStatus,
  deliveredAt,
  disputed = false,
  refunded = false,
  now = new Date(),
}: {
  orderStatus: OrderStatus;
  deliveredAt?: Date | null;
  disputed?: boolean;
  refunded?: boolean;
  now?: Date;
}): SettlementStatus {
  if (disputed || refunded) {
    return "ON_HOLD";
  }

  if (orderStatus !== "DELIVERED") {
    return "PENDING_DELIVERY";
  }

  if (!deliveredAt) {
    return "SETTLEMENT_PENDING";
  }

  if (
    isSettlementReady(
      deliveredAt,
      now,
      SETTLEMENT_HOLD_DAYS
    )
  ) {
    return "READY_FOR_PAYOUT";
  }

  return "SETTLEMENT_PENDING";
}

/**
 * Create a simple payment reference.
 */
export function createPaymentReference(): string {
  const timestamp = Date.now();

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `BSG-PAY-${timestamp}-${randomPart}`;
}

/**
 * Create a settlement reference.
 */
export function createSettlementReference(): string {
  const timestamp = Date.now();

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `BSG-SET-${timestamp}-${randomPart}`;
}
