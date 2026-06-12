import { Brand, Product, Stock, Bill } from "../types/models";
import { API_BASE } from "./api";

const BASE_URL = API_BASE;

export interface BillItemPayload {
  stockId?: number;
  productId: number;
  size: number;
  quantity: number;
  mrp: number;
  purchasePrice: number;
  defaultSellingPrice: number;
  actualUnitPrice: number;
  total: number;
  lineMargin: number;
}

export interface BillRequest {
  paymentMode: string;
  manualAdjustment?: number;
  items: BillItemPayload[];
}

export const storageService = {
  async getBrands(): Promise<Brand[]> {
    const res = await fetch(`${BASE_URL}/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },

  async getSizeStock(status?: string): Promise<Stock[]> {
    const url = status ? `${BASE_URL}/stocks?status=${status}` : `${BASE_URL}/stocks`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch size stock");
    return res.json();
  },

  async addBrand(data: { name: string }): Promise<Brand> {
    const res = await fetch(`${BASE_URL}/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add brand");
    return res.json();
  },

  async updateBrand(id: string, data: { name: string }): Promise<Brand> {
    const res = await fetch(`${BASE_URL}/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update brand");
    return res.json();
  },

  async deleteBrand(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/brands/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("brand is in use");
  },

  async updateStock(stockId: number, data: {
    size: number;
    purchasePrice: number;
    mrp: number;
    sellingPrice: number;
    quantity: number;
    stockStatus: string;
    section: string;
    rack: string;
    shelf: string;
  }): Promise<Stock> {
    const res = await fetch(`${BASE_URL}/stocks/${stockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update stock");
    return res.json();
  },

  async addFootwear(data: {
    brandId: number;
    subBrand?: string;
    article?: string;
    category: string;
    kidsSubCategory?: string;
    type: string;
    color: string;
    section?: string;
    rack?: string;
    shelf?: string;
  }): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add footwear");
    return res.json();
  },

  async getFootwear(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.content ?? [];
  },

  async getStockByProduct(productId: number): Promise<Stock[]> {
    const res = await fetch(`${BASE_URL}/stocks/product/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch stock");
    return res.json();
  },

  async addStock(stock: {
    product: { id: number };
    size: number;
    quantity: number;
    purchasePrice: number;
    mrp: number;
    sellingPrice: number;
    stockStatus?: string;
    section: string;
    rack: string;
    shelf: string;
  }) {
    const res = await fetch(`${BASE_URL}/stocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stock),
    });
    if (!res.ok) throw new Error("Failed to add stock");
    return res.json();
  },

  async deleteStock(stockId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/stocks/${stockId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete stock");
  },

  async getBills(): Promise<Bill[]> {
    const res = await fetch(`${BASE_URL}/bills`);
    if (!res.ok) throw new Error("Failed to fetch bills");
    return res.json();
  },

  async getBillById(id: number): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills/${id}`);
    if (!res.ok) throw new Error("Failed to fetch bill");
    return res.json();
  },

  async addBill(billRequest: BillRequest): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billRequest),
    });
    if (!res.ok) {
      let msg = "Failed to generate bill";
      try {
        const body = await res.json();
        msg = body.message || msg;
      } catch {
        msg = await res.text() || msg;
      }
      throw new Error(msg);
    }
    return res.json();
  },

  async returnBillItem(billId: number, billItemId: number, returnQty: number): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills/${billId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billItemId, returnQty }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error("Return failed: " + msg);
    }
    return res.json();
  },

  async downloadSalesPdf(from: string, to: string, paymentMode?: string): Promise<Blob> {
    let url = `${BASE_URL}/reports/sales/pdf?from=${from}&to=${to}`;
    if (paymentMode) url += `&paymentMode=${paymentMode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("PDF export failed");
    return res.blob();
  },

  async downloadSalesExcel(from: string, to: string, paymentMode?: string): Promise<Blob> {
    let url = `${BASE_URL}/reports/sales/excel?from=${from}&to=${to}`;
    if (paymentMode) url += `&paymentMode=${paymentMode}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Excel export failed");
    return res.blob();
  },
};
