export interface Medicine {
  id: string;
  shop_id?: string;
  name: string;
  generic_name?: string;
  category: string;
  manufacturer: string;
  batch_number?: string;
  mrp: number;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  expiry_date: string; // YYYY-MM-DD
  supplier?: string;
  created_at?: string;
}

export interface BillItem {
  medicine_id: string;
  name: string;
  quantity: number;
  mrp: number;
  selling_price: number;
  total: number;
}

export interface Bill {
  id: string;
  shop_id?: string;
  customer_name: string;
  customer_phone: string;
  items: BillItem[];
  sub_total: number;
  gst_percentage: number;
  gst_amount: number;
  grand_total: number;
  date: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}
