function getCurrencyFractionDigits(value: number) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue === 0 || absoluteValue >= 1) {
    return 2;
  }

  if (absoluteValue < 0.000001) {
    return 12;
  }

  if (absoluteValue < 0.01) {
    return 6;
  }

  return 6;
}

export function formatCurrency(value: number) {
  const digits = getCurrencyFractionDigits(value);
  const minimumFractionDigits = value === 0 || Math.abs(value) >= 1 ? digits : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof value === "string" ? new Date(value) : value);
}