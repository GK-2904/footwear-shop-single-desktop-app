// src/services/storage.ts
import {
  Brand,
  Product,
  Stock,
  Bill
} from "../types/models";

/* ================= BASE URL ================= */

const BASE_URL = "http://localhost:8080/api";

/* ================= BILL REQUEST TYPE ================= */

export interface BillRequest {
  ownerName: string;
  gstPercentage: number;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

/* ================= STORAGE SERVICE ================= */

export const storageService = {

  /* =======================
     BRAND APIs
  ======================= */

  async getBrands(): Promise<Brand[]> {
    const res = await fetch(`${BASE_URL}/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },

 async getSizeStock() {
  const res = await fetch("http://localhost:8080/api/stocks");

  if (!res.ok) {
    throw new Error("Failed to fetch size stock");
  }

  return await res.json();
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
    const res = await fetch(`${BASE_URL}/brands/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("brand is in use ");
  },

 /* =======================
   STOCK APIs
======================= */


  async updateStock(
  stockId: number,
  data: {
    size: number;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
    section: string;
    rack: string;
    shelf: string;
  }
): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/stocks/${stockId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update stock");
  return res.json();
},




  async addFootwear(data: any): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to add footwear");
  }

  return res.json();
},


  async getFootwear(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();

    // ✅ ALWAYS RETURN ARRAY
    return Array.isArray(data) ? data : data?.content ?? [];
  },


  // ✅ REQUIRED FOR BILLING (STOCK REDUCTION)
  async updateFootwear(
    id: number,
    data: { quantity: number }
  ): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update footwear");
    return res.json();
  },

  /* =======================
     STOCK APIs
  ======================= */

  async getStockByProduct(productId: number): Promise<Stock[]> {
    const res = await fetch(`${BASE_URL}/stocks/product/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch stock");
    return res.json();
  },

  async addStock(stock: {
  product: { id: number };
  size: number;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
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


  async updateStockQuantity(
    stockId: number,
    quantity: number
  ): Promise<Stock> {
    const res = await fetch(
      `${BASE_URL}/stocks/${stockId}/quantity?quantity=${quantity}`,
      { method: "PUT" }
    );

    if (!res.ok) throw new Error("Failed to update stock quantity");
    return res.json();
  },
  
  async deleteStock(stockId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/stocks/${stockId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete stock");
},


  /* =======================
     BILLING APIs
  ======================= */

  async getBills(): Promise<Bill[]> {
    const res = await fetch(`${BASE_URL}/bills`);
    if (!res.ok) throw new Error("Failed to fetch bills");
    return res.json();
  },

  // ✅ CORRECT BILL API (MATCHES BACKEND)
  async addBill(billRequest: BillRequest): Promise<Bill> {
    const res = await fetch(`${BASE_URL}/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billRequest),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error("Failed to generate bill: " + msg);
    }

    return res.json();
  },
};
