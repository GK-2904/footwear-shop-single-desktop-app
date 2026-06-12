export interface Brand {
  id?: number;
  name: string;
}

export interface BillItem {
  id?: number;
  productName: string;
  subBrand?: string;
  article?: string;
  category?: string;
  type?: string;
  color?: string;
  size: number;
  quantity: number;
  mrp?: number;
  purchasePrice?: number;
  defaultSellingPrice?: number;
  actualUnitPrice: number;
  lineMargin?: number;
  total: number;
  returnedQty?: number;
  returnedAmount?: number;
  returnableQty?: number;
}

export interface Bill {
  id: number;
  billNo?: string;
  financialYearName?: string;
  paymentMode: string;
  subTotal: number;
  manualAdjustment?: number;
  totalAmount: number;
  totalMargin?: number;
  totalReturned?: number;
  netTotal?: number;
  netMargin?: number;
  billDate: string;
  billTime: string;
  items?: BillItem[];
}

export interface Footwear {
  id: number;
  brand?: { name: string };
  subBrand?: string;
  article?: string;
  category: string;
  kidsSubCategory?: string;
  type: string;
  color: string;
  section: string;
  rack: string;
  shelf: string;
  quantity: number;
}

export interface Product {
  id?: number;
  brand: { id: number };
  subBrand?: string;
  article?: string;
  category: string;
  kidsSubCategory?: string;
  type: string;
  color?: string;
}

export interface Stock {
  id?: number;
  product: {
    id: number;
    subBrand?: string;
    article?: string;
    category?: string;
    kidsSubCategory?: string;
    type?: string;
    color?: string;
    brand?: { id: number; name: string };
  };
  size: number;
  purchasePrice: number;
  mrp?: number;
  sellingPrice: number;
  quantity: number;
  stockStatus?: string;
  section?: string;
  rack?: string;
  shelf?: string;
}
