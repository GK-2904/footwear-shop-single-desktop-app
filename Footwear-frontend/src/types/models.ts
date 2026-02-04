export interface Brand {
  id?: number;
  name: string;
}

export interface Bill {
  id: number;
  ownerName: string;
  gstPercentage: number;
  subTotal: number;
  gstAmount: number;
  totalAmount: number;
  billDate: string;   // "2026-01-12"
  billTime: string;   // "19:15:46.324869"
}



export interface Footwear {
  id: number;
  brand?: { name: string };
  category: string;
  type: string;
  color: string;
  section: string;
  rack: string;
  shelf: string;
  quantity: number; // derived field
}


export interface Product {
  id?: number;
  brand: { id: number };
  category: string;
  type: string;
  section: string;
  color?: string;
}

export interface Stock {
  id?: number;
  product: { id: number };
  size: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

export interface BillItemRequest {
  product: { id: number };
  size: string;
  quantity: number;
  price: number;
}

export interface BillRequest {
  ownerName: string;
  gstPercentage: number;
  items: BillItemRequest[];
}
