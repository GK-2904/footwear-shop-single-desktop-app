export interface Footwear {
  id: string;
  brandId: string;
  brandName: string;
  category: 'Men' | 'Women' | 'Kids';
  type: 'Sports' | 'Casual' | 'Formal' | 'Sandals' | 'Slippers';
  size: string;
  color: string;
  section: string;
  rack: string;
  shelf: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
}

export interface BillItem {
  footwearId: string;
  brandName: string;
  category: string;
  type: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  items: BillItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface DashboardStats {
  totalStock: number;
  totalBrands: number;
  lowStockItems: number;
  todaySales: number;
  todayBills: number;
}
