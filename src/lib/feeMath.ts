export function normalizeMoney(value: unknown) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function getFinalPayableFee(input: {
  finalPayableFee?: unknown;
  totalProgramFee?: unknown;
  discountAmount?: unknown;
}) {
  if (input.finalPayableFee !== undefined && input.finalPayableFee !== null) {
    return normalizeMoney(input.finalPayableFee);
  }

  return Math.max(0, normalizeMoney(input.totalProgramFee) - normalizeMoney(input.discountAmount));
}

export function getSafeRemainingBalance(input: {
  finalPayableFee?: unknown;
  totalProgramFee?: unknown;
  discountAmount?: unknown;
  totalPaid?: unknown;
  remainingBalance?: unknown;
}) {
  const hasFeeBasis =
    input.finalPayableFee !== undefined ||
    input.totalProgramFee !== undefined ||
    input.discountAmount !== undefined ||
    input.totalPaid !== undefined;

  if (!hasFeeBasis) {
    return normalizeMoney(input.remainingBalance);
  }

  // Keep displays and recalculations from ever exposing legacy negative balances.
  return Math.max(0, getFinalPayableFee(input) - normalizeMoney(input.totalPaid));
}

export function formatRupees(value: unknown) {
  return `Rs ${normalizeMoney(value).toLocaleString("en-PK")}`;
}
