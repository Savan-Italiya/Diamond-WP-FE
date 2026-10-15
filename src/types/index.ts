export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  roles: string[];
  permissions: string[];
}

export interface StockSummary {
  lots: {
    total_lots: number;
    total_carats: number;
    total_valuation_inr: number;
  };
  solitaires: {
    total_solitaires: number;
    total_carats: number;
  };
  aggregated_carats: number;
  timestamp: string;
}

export interface DiamondLot {
  id: string;
  lot_number: string;
  category_name?: string;
  total_carat: number;
  current_carat: number;
  cost_per_carat: number;
  purchase_date: string;
  status: 'IN_STOCK' | 'SOLD' | 'IN_PROCESS' | 'MEMO';
}

export interface SingleDiamond {
  id: string;
  lot_number?: string;
  lot_id?: string;
  cert_type: 'GIA' | 'IGI' | 'HRD' | 'NON_CERT';
  cert_number?: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  lab_video_url?: string;
  status: string;
}

export interface DebtorsAgeing {
  under_30_days: Array<{
    id: string;
    business_name: string;
    amount_due: number;
    due_date: string;
    invoice_number: string;
  }>;
  days_31_to_60: Array<{
    id: string;
    business_name: string;
    amount_due: number;
    due_date: string;
    invoice_number: string;
  }>;
  days_61_to_90: Array<{
    id: string;
    business_name: string;
    amount_due: number;
    due_date: string;
    invoice_number: string;
  }>;
  over_90_days: Array<{
    id: string;
    business_name: string;
    amount_due: number;
    due_date: string;
    invoice_number: string;
  }>;
  total_outstanding: number;
}

export interface FollowUpItem {
  schedule_id: string;
  due_date: string;
  amount_due: number;
  status: string;
  party_id: string;
  business_name: string;
  owner_name: string;
  phone_primary: string;
  invoice_number: string;
  one_tap_dial_url: string;
  whatsapp_app_url: string;
  whatsapp_web_url: string;
}

export interface MemoBill {
  id: string;
  memo_number: string;
  party_id?: string;
  party_name: string;
  party_phone: string;
  broker_id?: string;
  broker_name?: string;
  memo_type: 'MEMO_GIVEN' | 'MEMO_RECEIVED';
  issue_date: string;
  return_due_date: string;
  status: 'OPEN' | 'PARTIALLY_RETURNED' | 'SETTLED' | 'CANCELLED';
  items: Array<{
    id: string;
    lot_id?: string;
    single_diamond_id?: string;
    carat: number;
    asking_price: number;
    status: 'WITH_PARTY' | 'RETURNED' | 'SOLD';
  }>;
}

export interface Party {
  id: string;
  business_name: string;
  owner_name: string;
  phone_primary: string;
  phone_secondary?: string;
  gstin?: string;
  pan?: string;
  party_type: 'BUYER' | 'SELLER' | 'BROKER' | 'PROCESSOR';
  credit_limit: number;
  current_balance?: number;
  city?: string;
  state?: string;
  bank_name?: string;
  account_no?: string;
  ifsc?: string;
  upi_id?: string;
  default_commission_rate?: number;
}

export interface LedgerEntry {
  id: string;
  party_id?: string;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: number;
  reference_type: string;
  reference_id: string;
  running_balance: number;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  broker_id?: string;
  broker_name?: string;
  invoice_number: string;
  total_carat: number;
  gross_amount: number;
  discount_pct: number;
  net_amount: number;
  payment_due_date: string;
  deal_status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'SETTLED' | 'CANCELLED';
  created_at?: string;
  items?: Array<{
    id: string;
    carat: number;
    rate_per_carat: number;
    total_price: number;
  }>;
}

export interface PurchaseOrder {
  id: string;
  seller_id: string;
  seller_name?: string;
  broker_id?: string;
  broker_name?: string;
  bill_number: string;
  total_amount: number;
  payment_terms_days: number;
  order_date: string;
  created_at?: string;
}

export interface BrokerageItem {
  id: string;
  transaction_type: 'SALES' | 'PURCHASE' | 'MEMO';
  transaction_id: string;
  broker_id: string;
  broker_name: string;
  commission_pct: number;
  total_brokerage_amount: number;
  payment_status: 'PENDING' | 'PAID' | 'WAIVED';
}

export interface RepairSlip {
  id: string;
  slip_number?: string;
  issue_date: string;
  processor_party_id: string;
  processor_name?: string;
  status: 'SENT_TO_WORKSHOP' | 'IN_REPAIR' | 'RETURNED_PARTIAL' | 'COMPLETED';
  items?: Array<{
    id: string;
    lot_id?: string;
    single_diamond_id?: string;
    original_weight: number;
    returned_weight?: number;
    carat_loss?: number;
    processing_charge?: number;
    reason: string;
    status?: string;
  }>;
}

export interface SystemAuditRecord {
  id: string;
  user_name?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  table_name: string;
  record_id: string;
  old_value_json?: any;
  new_value_json?: any;
  ip_address?: string;
  timestamp: string;
}

export interface WhatsAppTemplate {
  id: string;
  template_name: string;
  message_body: string;
  category: 'PAYMENT_REMINDER' | 'MEMO_CHALLAN' | 'NEW_ARRIVAL';
}
