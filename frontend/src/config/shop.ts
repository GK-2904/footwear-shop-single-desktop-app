export interface ShopConfig {
  name: string;
  address: string;
  phone: string;
  gstin: string;
}

export const DEFAULT_SHOP: ShopConfig = {
  name: "Shivam Footwear Shop",
  address: "Your Shop Address Here",
  phone: "+91 XXXXXXXXXX",
  gstin: "",
};
