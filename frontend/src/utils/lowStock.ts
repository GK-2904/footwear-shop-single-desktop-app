import { storageService } from "../services/storage";

export interface LowStockRow {
  stockId: number;
  productId: number;
  brandName: string;
  subBrand: string;
  article: string;
  category: string;
  type: string;
  color: string;
  size: number;
  quantity: number;
  section: string;
  rack: string;
  shelf: string;
  stockStatus: string;
}

const LOW_STOCK_THRESHOLD = 5;

export async function fetchLowStockRows(): Promise<LowStockRow[]> {
  const stocks = await storageService.getSizeStock();
  const seen = new Set<number>();
  const rows: LowStockRow[] = [];

  for (const s of stocks) {
    if (!s.id || seen.has(s.id) || s.quantity > LOW_STOCK_THRESHOLD) continue;
    seen.add(s.id);
    rows.push({
      stockId: s.id,
      productId: s.product.id,
      brandName: s.product.brand?.name || "Unknown",
      subBrand: s.product.subBrand || "",
      article: s.product.article || "",
      category: s.product.category || "",
      type: s.product.type || "",
      color: s.product.color || "",
      size: s.size,
      quantity: s.quantity,
      section: s.section || "",
      rack: s.rack || "",
      shelf: s.shelf || "",
      stockStatus: s.stockStatus || "ACTIVE",
    });
  }

  return rows.sort((a, b) => a.quantity - b.quantity);
}

export async function fetchAllStockRows(): Promise<LowStockRow[]> {
  const stocks = await storageService.getSizeStock();
  const seen = new Set<number>();
  const rows: LowStockRow[] = [];

  for (const s of stocks) {
    if (!s.id || seen.has(s.id)) continue;
    seen.add(s.id);
    rows.push({
      stockId: s.id,
      productId: s.product.id,
      brandName: s.product.brand?.name || "Unknown",
      subBrand: s.product.subBrand || "",
      article: s.product.article || "",
      category: s.product.category || "",
      type: s.product.type || "",
      color: s.product.color || "",
      size: s.size,
      quantity: s.quantity,
      section: s.section || "",
      rack: s.rack || "",
      shelf: s.shelf || "",
      stockStatus: s.stockStatus || "ACTIVE",
    });
  }

  return rows.sort((a, b) => a.brandName.localeCompare(b.brandName));
}
