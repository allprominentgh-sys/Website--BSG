// lib/advertising.ts

/**
 * BEST SALES GHANA
 * Marketplace Advertising System
 *
 * Advertising packages for individual marketplace sellers.
 */

export const AD_PACKAGES = {
  TOP_PRIORITY: {
    id: "top-priority",
    name: "Top Priority",
    price: 1700,
    currency: "GHS",
    durationDays: 365,
    durationLabel: "1 Year",
    description:
      "Highest-level advertising placement for maximum visibility.",
  },

  PRIORITY: {
    id: "priority",
    name: "Priority",
    price: 500,
    currency: "GHS",
    durationDays: 90,
    durationLabel: "3 Months",
    description:
      "Priority advertising placement for sellers who want extended visibility.",
  },

  TOP_ADS: {
    id: "top-ads",
    name: "Top Ads",
    price: 250,
    currency: "GHS",
    durationDays: 30,
    durationLabel: "1 Month",
    description:
      "Promote your listing for one month with top advertising placement.",
  },

  PREMIUM_ADS: {
    id: "premium-ads",
    name: "Premium Ads",
    price: 138,
    currency: "GHS",
    durationDays: 30,
    durationLabel: "1 Month",
    description:
      "Premium advertising placement for one month.",
  },
} as const;

export type AdvertisingPackageId =
  (typeof AD_PACKAGES)[keyof typeof AD_PACKAGES]["id"];

export type AdvertisingStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED";

export type AdvertisingPurchase = {
  id: string;
  sellerId: string;
  listingId: string;
  packageId: AdvertisingPackageId;
  packageName: string;
  amount: number;
  currency: string;
  status: AdvertisingStatus;
  paymentReference: string;
  startedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
};

/**
 * Return all advertising packages.
 */
export function getAdvertisingPackages() {
  return Object.values(AD_PACKAGES);
}

/**
 * Find an advertising package by ID.
 */
export function getAdvertisingPackage(
  packageId: AdvertisingPackageId
) {
  return Object.values(AD_PACKAGES).find(
    (item) => item.id === packageId
  );
}

/**
 * Calculate advertising expiry date.
 *
 * Example:
 * Start date: 10 September
 * 30-day package: expires 10 October
 */
export function calculateAdExpiryDate(
  startedAt: Date,
  durationDays: number
): Date {
  if (
    !(startedAt instanceof Date) ||
    Number.isNaN(startedAt.getTime())
  ) {
    throw new Error("Invalid advertising start date.");
  }

  if (!Number.isInteger(durationDays) || durationDays <= 0) {
    throw new Error("Invalid advertising duration.");
  }

  const expiryDate = new Date(startedAt);

  expiryDate.setDate(
    expiryDate.getDate() + durationDays
  );

  return expiryDate;
}

/**
 * Calculate expiry based on the selected package.
 */
export function calculatePackageExpiry(
  packageId: AdvertisingPackageId,
  startedAt: Date = new Date()
): Date {
  const advertisingPackage =
    getAdvertisingPackage(packageId);

  if (!advertisingPackage) {
    throw new Error("Advertising package not found.");
  }

  return calculateAdExpiryDate(
    startedAt,
    advertisingPackage.durationDays
  );
}

/**
 * Check whether an advertising campaign is active.
 */
export function isAdActive(
  startedAt: Date | null,
  expiresAt: Date | null,
  now: Date = new Date()
): boolean {
  if (!startedAt || !expiresAt) {
    return false;
  }

  return (
    now.getTime() >= startedAt.getTime() &&
    now.getTime() < expiresAt.getTime()
  );
}

/**
 * Automatically determine advertising status.
 */
export function getAdvertisingStatus(
  startedAt: Date | null,
  expiresAt: Date | null,
  paymentSuccessful: boolean,
  now: Date = new Date()
): AdvertisingStatus {
  if (!paymentSuccessful) {
    return "PENDING_PAYMENT";
  }

  if (!startedAt || !expiresAt) {
    return "PENDING_PAYMENT";
  }

  if (now.getTime() >= expiresAt.getTime()) {
    return "EXPIRED";
  }

  if (isAdActive(startedAt, expiresAt, now)) {
    return "ACTIVE";
  }

  return "PENDING_PAYMENT";
}

/**
 * Create an advertising payment reference.
 */
export function createAdvertisingPaymentReference(): string {
  const timestamp = Date.now();

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `BSG-AD-${timestamp}-${randomPart}`;
}

/**
 * Create an advertising campaign ID.
 */
export function createAdvertisingId(): string {
  const timestamp = Date.now();

  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `BSG-CAM-${timestamp}-${randomPart}`;
}

/**
 * Create a new advertising purchase record.
 *
 * This does NOT charge the customer.
 * Real payment processing will be connected later.
 */
export function createAdvertisingPurchase({
  sellerId,
  listingId,
  packageId,
}: {
  sellerId: string;
  listingId: string;
  packageId: AdvertisingPackageId;
}): AdvertisingPurchase {
  const advertisingPackage =
    getAdvertisingPackage(packageId);

  if (!advertisingPackage) {
    throw new Error("Advertising package not found.");
  }

  return {
    id: createAdvertisingId(),
    sellerId,
    listingId,
    packageId,
    packageName: advertisingPackage.name,
    amount: advertisingPackage.price,
    currency: advertisingPackage.currency,
    status: "PENDING_PAYMENT",
    paymentReference:
      createAdvertisingPaymentReference(),
    startedAt: null,
    expiresAt: null,
    createdAt: new Date(),
  };
}

/**
 * Activate an advertising campaign after successful payment.
 */
export function activateAdvertisingPurchase(
  purchase: AdvertisingPurchase,
  startedAt: Date = new Date()
): AdvertisingPurchase {
  const expiresAt = calculatePackageExpiry(
    purchase.packageId,
    startedAt
  );

  return {
    ...purchase,
    status: "ACTIVE",
    startedAt,
    expiresAt,
  };
}

/**
 * Check and automatically expire a campaign.
 */
export function updateAdvertisingStatus(
  purchase: AdvertisingPurchase,
  now: Date = new Date()
): AdvertisingPurchase {
  if (
    purchase.status === "ACTIVE" &&
    purchase.expiresAt &&
    now.getTime() >= purchase.expiresAt.getTime()
  ) {
    return {
      ...purchase,
      status: "EXPIRED",
    };
  }

  return purchase;
}

/**
 * Return the number of days remaining.
 */
export function getDaysRemaining(
  expiresAt: Date | null,
  now: Date = new Date()
): number {
  if (!expiresAt) {
    return 0;
  }

  const difference =
    expiresAt.getTime() - now.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}
