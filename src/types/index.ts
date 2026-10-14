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
  status: string;
}

export interface DebtorsAgeing {
  under_30_days: Array<any>;
  days_31_to_60: Array<any>;
  days_61_to_90: Array<any>;
  over_90_days: Array<any>;
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
  party_name: string;
  party_phone: string;
  broker_name?: string;
  memo_type: 'MEMO_GIVEN' | 'MEMO_RECEIVED';
  issue_date: string;
  return_due_date: string;
  status: string;
  items: Array<{
    id: string;
    carat: number;
    asking_price: number;
    status: string;
  }>;
}

export interface LedgerEntry {
  id: string;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: number;
  reference_type: string;
  reference_id: string;
  running_balance: number;
  created_at: string;
}
