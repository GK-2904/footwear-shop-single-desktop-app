export const CATEGORIES = ["Men", "Women", "Kids"] as const;
export const KIDS_SUB = ["Boys", "Girls"] as const;
export const FOOTWEAR_TYPES = [
  "Chappal",
  "Shoes",
  "Crocs",
  "Yuva",
  "Flipflop",
  "Socks",
  "Loose",
] as const;
export const STOCK_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "READY_FOR_SALE", label: "Ready for Sale" },
] as const;
export const PAYMENT_MODES = ["CASH", "UPI"] as const;

export function formatDate(date: string | undefined): string {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${d}-${m}-${y}`;
}
