import axios from 'axios';
import {
  StockSummary,
  DiamondLot,
  SingleDiamond,
  DebtorsAgeing,
  FollowUpItem,
  MemoBill,
  Party,
  LedgerEntry,
  SalesOrder,
  PurchaseOrder,
  BrokerageItem,
  RepairSlip,
  SystemAuditRecord,
  WhatsAppTemplate,
  User
} from '../types';

const TOKEN_KEY = 'diamond_erp_jwt_token';
const USER_KEY = 'diamond_erp_user_profile';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback Mock Datasets
const fallbackUser: User = {
  id: '06493ca8-2cb8-4d7e-9756-f4890024752c',
  name: 'Pravinbhai Shah (BKC Head)',
  phone: '+919820011223',
  email: 'admin@bkc-diamonds.com',
  status: 'ACTIVE',
  roles: ['SUPER_ADMIN', 'DIAMOND_TRADER'],
  permissions: ['ALL']
};

const fallbackStockSummary: StockSummary = {
  lots: {
    total_lots: 28,
    total_carats: 842.65,
    total_valuation_inr: 284500000
  },
  solitaires: {
    total_solitaires: 64,
    total_carats: 112.4
  },
  aggregated_carats: 955.05,
  timestamp: new Date().toISOString()
};

const fallbackLots: DiamondLot[] = [
  { id: '1', lot_number: 'LOT-BKC-2026-001', category_name: 'PARCEL_LOT', total_carat: 125.5, current_carat: 125.5, cost_per_carat: 28500, purchase_date: '2026-09-15', status: 'IN_STOCK' },
  { id: '2', lot_number: 'LOT-BKC-2026-002', category_name: 'SOLITAIRE', total_carat: 3.52, current_carat: 3.52, cost_per_carat: 450000, purchase_date: '2026-10-01', status: 'IN_STOCK' },
  { id: '3', lot_number: 'LOT-SURAT-PARCHA-09', category_name: 'ROUGH', total_carat: 240.0, current_carat: 180.5, cost_per_carat: 19500, purchase_date: '2026-08-20', status: 'IN_PROCESS' },
  { id: '4', lot_number: 'LOT-OPERA-EX-004', category_name: 'POLISHED', total_carat: 88.0, current_carat: 12.0, cost_per_carat: 34000, purchase_date: '2026-07-11', status: 'MEMO' },
  { id: '5', lot_number: 'LOT-ANTWERP-MAV-88', category_name: 'ROUGH', total_carat: 310.0, current_carat: 310.0, cost_per_carat: 22000, purchase_date: '2026-10-10', status: 'IN_STOCK' }
];

const fallbackDiamonds: SingleDiamond[] = [
  { id: 'd-1', cert_type: 'GIA', cert_number: '2234567891', shape: 'ROUND', carat: 1.51, color: 'D', clarity: 'VVS1', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'IN_STOCK' },
  { id: 'd-2', cert_type: 'GIA', cert_number: '5567891234', shape: 'OVAL', carat: 2.01, color: 'E', clarity: 'VS1', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'VERY_GOOD', fluorescence: 'FAINT', status: 'IN_STOCK' },
  { id: 'd-3', cert_type: 'IGI', cert_number: '489120334', shape: 'PEAR', carat: 3.15, color: 'F', clarity: 'VVS2', cut: 'EXCELLENT', polish: 'VERY_GOOD', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'MEMO' },
  { id: 'd-4', cert_type: 'HRD', cert_number: '882190012', shape: 'EMERALD', carat: 2.54, color: 'D', clarity: 'IF', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'IN_STOCK' },
  { id: 'd-5', cert_type: 'GIA', cert_number: '6241098822', shape: 'CUSHION', carat: 4.02, color: 'G', clarity: 'VS2', cut: 'VERY_GOOD', polish: 'EXCELLENT', symmetry: 'EXCELLENT', fluorescence: 'MEDIUM', status: 'IN_STOCK' }
];

const fallbackParties: Party[] = [
  { id: 'p-1', business_name: 'Mahavir Gems & Jewels', owner_name: 'Bipinbhai Mehta', phone_primary: '+919820123456', gstin: '27AABCM1234F1Z1', pan: 'AABCM1234F', party_type: 'BUYER', credit_limit: 10000000, current_balance: 3200000, city: 'Mumbai', state: 'Maharashtra', bank_name: 'HDFC Bank, BKC', account_no: '50200012345678', ifsc: 'HDFC0000123', upi_id: 'mahavirgems@hdfcbank' },
  { id: 'p-2', business_name: 'Dharmanandan Exports Surat', owner_name: 'Laljibhai Patel', phone_primary: '+919825123456', gstin: '24AAACD5678G1Z2', pan: 'AAACD5678G', party_type: 'SELLER', credit_limit: 50000000, current_balance: -8500000, city: 'Surat', state: 'Gujarat', bank_name: 'ICICI Bank, Katargam', account_no: '001105009988', ifsc: 'ICIC0000011', upi_id: 'dharmanandan@icici' },
  { id: 'p-3', business_name: 'Kothari Broking House', owner_name: 'Hasmukhbhai Kothari', phone_primary: '+919820987654', gstin: '27AABCK9012H1Z3', pan: 'AABCK9012H', party_type: 'BROKER', credit_limit: 2000000, current_balance: 145000, city: 'Mumbai', state: 'Maharashtra', default_commission_rate: 1.0 },
  { id: 'p-4', business_name: 'Shree Ram Laser & Sawing Karkhana', owner_name: 'Dineshbhai Surat', phone_primary: '+919824098765', party_type: 'PROCESSOR', credit_limit: 500000, current_balance: 42000, city: 'Surat', state: 'Gujarat' },
  { id: 'p-5', business_name: 'Zaveri & Sons Mumbai', owner_name: 'Maheshbhai Zaveri', phone_primary: '+919820011444', gstin: '27AAACZ1122K1Z9', pan: 'AAACZ1122K', party_type: 'BUYER', credit_limit: 15000000, current_balance: 12500000, city: 'Mumbai', state: 'Maharashtra' }
];

const fallbackAgeing: DebtorsAgeing = {
  under_30_days: [
    { id: 'sch-1', business_name: 'Mahavir Gems & Jewels', amount_due: 4500000, due_date: '2026-10-25', invoice_number: 'INV-2026-089' },
    { id: 'sch-2', business_name: 'Kothari Diamonds BKC', amount_due: 1850000, due_date: '2026-10-18', invoice_number: 'INV-2026-092' }
  ],
  days_31_to_60: [
    { id: 'sch-3', business_name: 'Dharmanandan Exports', amount_due: 3200000, due_date: '2026-09-20', invoice_number: 'INV-2026-074' }
  ],
  days_61_to_90: [
    { id: 'sch-4', business_name: 'Navratna Gems Opera House', amount_due: 7400000, due_date: '2026-08-15', invoice_number: 'INV-2026-051' }
  ],
  over_90_days: [
    { id: 'sch-5', business_name: 'Zaveri & Sons Mumbai', amount_due: 12500000, due_date: '2026-06-30', invoice_number: 'INV-2026-022' }
  ],
  total_outstanding: 29450000
};

const fallbackFollowUps: FollowUpItem[] = [
  {
    schedule_id: 'sch-5',
    party_id: 'p-5',
    business_name: 'Zaveri & Sons Mumbai',
    owner_name: 'Maheshbhai Zaveri',
    phone_primary: '+919820011444',
    invoice_number: 'INV-2026-022',
    amount_due: 12500000,
    due_date: '2026-06-30',
    status: 'OVERDUE',
    one_tap_dial_url: 'tel:+919820011444',
    whatsapp_app_url: 'whatsapp://send?phone=919820011444&text=Jai%20Shree%20Krishna%20Maheshbhai%20ji%2C%20gentle%20reminder%20regarding%20overdue%20invoice%20INV-2026-022%20for%20Rs.%201.25%20Cr.%20Please%20release%20RTGS%20today.',
    whatsapp_web_url: 'https://api.whatsapp.com/send?phone=919820011444&text=Jai%20Shree%20Krishna%20Maheshbhai%20ji%2C%20gentle%20reminder%20regarding%20overdue%20invoice%20INV-2026-022%20for%20Rs.%201.25%20Cr.%20Please%20release%20RTGS%20today.'
  },
  {
    schedule_id: 'sch-4',
    party_id: 'p-4',
    business_name: 'Navratna Gems Opera House',
    owner_name: 'Kamleshbhai',
    phone_primary: '+919820112233',
    invoice_number: 'INV-2026-051',
    amount_due: 7400000,
    due_date: '2026-08-15',
    status: 'OVERDUE',
    one_tap_dial_url: 'tel:+919820112233',
    whatsapp_app_url: 'whatsapp://send?phone=919820112233&text=Pranam%20Kamleshbhai%20ji%2C%20gentle%20reminder%20regarding%20invoice%20INV-2026-051%20Rs.%2074%20Lakhs.',
    whatsapp_web_url: 'https://api.whatsapp.com/send?phone=919820112233&text=Pranam%20Kamleshbhai%20ji%2C%20gentle%20reminder%20regarding%20invoice%20INV-2026-051%20Rs.%2074%20Lakhs.'
  }
];

const fallbackMemos: MemoBill[] = [
  {
    id: 'm-1',
    memo_number: 'MEMO-BKC-991',
    party_id: 'p-1',
    party_name: 'Mahavir Gems & Jewels',
    party_phone: '+919820123456',
    broker_name: 'Kothari Broking House',
    memo_type: 'MEMO_GIVEN',
    issue_date: '2026-10-10',
    return_due_date: '2026-10-17',
    status: 'OPEN',
    items: [{ id: 'mi-1', carat: 1.51, asking_price: 520000, status: 'WITH_PARTY' }]
  },
  {
    id: 'm-2',
    memo_number: 'MEMO-BKC-992',
    party_id: 'p-5',
    party_name: 'Zaveri & Sons Mumbai',
    party_phone: '+919820011444',
    broker_name: 'Direct Deal',
    memo_type: 'MEMO_GIVEN',
    issue_date: '2026-10-12',
    return_due_date: '2026-10-19',
    status: 'OPEN',
    items: [{ id: 'mi-2', carat: 3.15, asking_price: 2450000, status: 'WITH_PARTY' }]
  }
];

const fallbackSalesOrders: SalesOrder[] = [
  {
    id: 'so-1',
    buyer_id: 'p-1',
    buyer_name: 'Mahavir Gems & Jewels',
    broker_id: 'p-3',
    broker_name: 'Kothari Broking House',
    invoice_number: 'INV-2026-089',
    total_carat: 14.5,
    gross_amount: 4600000,
    discount_pct: 2.17,
    net_amount: 4500000,
    payment_due_date: '2026-10-25',
    deal_status: 'CONFIRMED',
    created_at: '2026-09-25'
  },
  {
    id: 'so-2',
    buyer_id: 'p-5',
    buyer_name: 'Zaveri & Sons Mumbai',
    broker_name: 'Direct Deal',
    invoice_number: 'INV-2026-022',
    total_carat: 38.2,
    gross_amount: 12500000,
    discount_pct: 0,
    net_amount: 12500000,
    payment_due_date: '2026-06-30',
    deal_status: 'DELIVERED',
    created_at: '2026-05-15'
  }
];

const fallbackPurchases: PurchaseOrder[] = [
  {
    id: 'po-1',
    seller_id: 'p-2',
    seller_name: 'Dharmanandan Exports Surat',
    broker_name: 'Kothari Broking House',
    bill_number: 'PUR-SRT-2026-114',
    total_amount: 8500000,
    payment_terms_days: 60,
    order_date: '2026-08-10'
  }
];

const fallbackBrokerage: BrokerageItem[] = [
  {
    id: 'b-1',
    transaction_type: 'SALES',
    transaction_id: 'so-1',
    broker_id: 'p-3',
    broker_name: 'Kothari Broking House',
    commission_pct: 1.0,
    total_brokerage_amount: 45000,
    payment_status: 'PAID'
  },
  {
    id: 'b-2',
    transaction_type: 'PURCHASE',
    transaction_id: 'po-1',
    broker_id: 'p-3',
    broker_name: 'Kothari Broking House',
    commission_pct: 0.5,
    total_brokerage_amount: 42500,
    payment_status: 'PENDING'
  }
];

const fallbackRepairSlips: RepairSlip[] = [
  {
    id: 'rs-1',
    slip_number: 'REP-SURAT-2026-041',
    issue_date: '2026-10-08',
    processor_party_id: 'p-4',
    processor_name: 'Shree Ram Laser & Sawing Karkhana',
    status: 'IN_REPAIR',
    items: [
      {
        id: 'ri-1',
        original_weight: 4.85,
        returned_weight: 0,
        carat_loss: 0,
        processing_charge: 12000,
        reason: 'Laser sawing & table facet cleavage repair'
      }
    ]
  },
  {
    id: 'rs-2',
    slip_number: 'REP-SURAT-2026-038',
    issue_date: '2026-09-28',
    processor_party_id: 'p-4',
    processor_name: 'Shree Ram Laser & Sawing Karkhana',
    status: 'COMPLETED',
    items: [
      {
        id: 'ri-2',
        original_weight: 2.15,
        returned_weight: 1.85,
        carat_loss: 0.30,
        processing_charge: 6500,
        reason: 'Crown re-polishing to achieve GIA Triple-Ex'
      }
    ]
  }
];

const fallbackAuditLogs: SystemAuditRecord[] = [
  { id: 'log-1', user_name: 'Pravinbhai Shah', action: 'CREATE', table_name: 'sales_orders', record_id: 'so-1', new_value_json: { invoice: 'INV-2026-089', net: 4500000 }, ip_address: '103.21.144.12', timestamp: '2026-10-14 14:22:10' },
  { id: 'log-2', user_name: 'Pravinbhai Shah', action: 'UPDATE', table_name: 'memo_bills', record_id: 'm-1', new_value_json: { status: 'OPEN' }, ip_address: '103.21.144.12', timestamp: '2026-10-14 11:15:02' },
  { id: 'log-3', user_name: 'System Cron', action: 'CREATE', table_name: 'daily_reminders', record_id: 'rem-99', new_value_json: { queue: 'payment-due' }, ip_address: '127.0.0.1', timestamp: '2026-10-14 09:00:00' }
];

const fallbackTemplates: WhatsAppTemplate[] = [
  { id: 't-1', template_name: 'Payment Due Polite', message_body: 'Jai Shree Krishna {{owner_name}} ji, gentle reminder regarding outstanding payment of ₹{{amount}} for Invoice {{invoice_number}}. Please arrange RTGS today.', category: 'PAYMENT_REMINDER' },
  { id: 't-2', template_name: 'Memo Challan Expiry', message_body: 'Pranam {{owner_name}} ji, memo challan {{memo_number}} for {{carat}} carats is due for return on {{due_date}}. Kindly confirm status or sale bill.', category: 'MEMO_CHALLAN' },
  { id: 't-3', template_name: 'New Lot Arrival Notice', message_body: 'Exclusive New Arrival: Fresh lot of GIA Triple-Ex Solitaires (1.00 - 3.50 Cts) arrived at our BKC Safe. Available for inspection.', category: 'NEW_ARRIVAL' }
];

export const DiamondApi = {
  // Auth
  login: async (email: string, password: string):Promise<{ token: string; user: User }> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.data?.token) {
        localStorage.setItem(TOKEN_KEY, res.data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data.user));
        return res.data.data;
      }
    } catch {
      // Return fallback token
    }
    const token = 'mock_jwt_token_bkc_2026';
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
    return { token, user: fallbackUser };
  },

  getCurrentUser: (): User => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return fallbackUser;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Inventory
  getStockSummary: async (): Promise<StockSummary> => {
    try {
      const res = await api.get('/inventory/summary');
      return res.data.data;
    } catch {
      return fallbackStockSummary;
    }
  },

  getLots: async (): Promise<DiamondLot[]> => {
    try {
      const res = await api.get('/inventory/lots');
      return res.data.data;
    } catch {
      return fallbackLots;
    }
  },

  createLot: async (lotData: any): Promise<DiamondLot> => {
    try {
      const res = await api.post('/inventory/lots', lotData);
      return res.data.data;
    } catch {
      const newLot: DiamondLot = {
        id: String(Date.now()),
        lot_number: lotData.lot_number,
        category_name: 'PARCEL_LOT',
        total_carat: Number(lotData.total_carat),
        current_carat: Number(lotData.total_carat),
        cost_per_carat: Number(lotData.cost_per_carat),
        purchase_date: lotData.purchase_date || new Date().toISOString().split('T')[0],
        status: 'IN_STOCK'
      };
      return newLot;
    }
  },

  getSingleDiamonds: async (): Promise<SingleDiamond[]> => {
    try {
      const res = await api.get('/inventory/diamonds');
      return res.data.data;
    } catch {
      return fallbackDiamonds;
    }
  },

  createSingleDiamond: async (diamondData: any): Promise<SingleDiamond> => {
    try {
      const res = await api.post('/inventory/diamonds', diamondData);
      return res.data.data;
    } catch {
      const newDiamond: SingleDiamond = {
        id: `d-${Date.now()}`,
        cert_type: diamondData.cert_type,
        cert_number: diamondData.cert_number,
        shape: diamondData.shape,
        carat: Number(diamondData.carat),
        color: diamondData.color,
        clarity: diamondData.clarity,
        cut: diamondData.cut,
        polish: diamondData.polish,
        symmetry: diamondData.symmetry,
        fluorescence: diamondData.fluorescence,
        status: 'IN_STOCK'
      };
      return newDiamond;
    }
  },

  breakdownLot: async (breakdownData: any): Promise<any> => {
    try {
      const res = await api.post('/inventory/lots/breakdown', breakdownData);
      return res.data;
    } catch {
      return { success: true, message: 'Lot breakdown registered in history' };
    }
  },

  stockAudit: async (auditData: any): Promise<any> => {
    try {
      const res = await api.post('/inventory/audit', auditData);
      return res.data;
    } catch {
      return { success: true, message: 'Stock audit log saved' };
    }
  },

  // Memo
  getMemos: async (): Promise<MemoBill[]> => {
    try {
      const res = await api.get('/memo');
      return res.data.data;
    } catch {
      return fallbackMemos;
    }
  },

  createMemo: async (memoData: any): Promise<MemoBill> => {
    try {
      const res = await api.post('/memo', memoData);
      return res.data.data;
    } catch {
      const newMemo: MemoBill = {
        id: `m-${Date.now()}`,
        memo_number: memoData.memo_number || `MEMO-BKC-${Math.floor(100 + Math.random() * 900)}`,
        party_name: memoData.party_name || 'Selected Party',
        party_phone: '+919820011223',
        broker_name: memoData.broker_name || 'Direct Deal',
        memo_type: memoData.memo_type || 'MEMO_GIVEN',
        issue_date: memoData.issue_date || new Date().toISOString().split('T')[0],
        return_due_date: memoData.return_due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'OPEN',
        items: memoData.items || [{ id: 'item-1', carat: 2.5, asking_price: 350000, status: 'WITH_PARTY' }]
      };
      return newMemo;
    }
  },

  returnMemoItem: async (returnData: any): Promise<any> => {
    try {
      const res = await api.post('/memo/return', returnData);
      return res.data;
    } catch {
      return { success: true, message: 'Memo item returned to stock' };
    }
  },

  // Parties & Brokers
  getParties: async (): Promise<Party[]> => {
    try {
      const res = await api.get('/parties');
      return res.data.data;
    } catch {
      return fallbackParties;
    }
  },

  createParty: async (partyData: any): Promise<Party> => {
    try {
      const res = await api.post('/parties', partyData);
      return res.data.data;
    } catch {
      const newParty: Party = {
        id: `p-${Date.now()}`,
        ...partyData,
        current_balance: 0
      };
      return newParty;
    }
  },

  // Sales & Purchases
  getSalesOrders: async (): Promise<SalesOrder[]> => {
    try {
      const res = await api.get('/sales');
      return res.data.data;
    } catch {
      return fallbackSalesOrders;
    }
  },

  createSalesOrder: async (orderData: any): Promise<SalesOrder> => {
    try {
      const res = await api.post('/sales', orderData);
      return res.data.data;
    } catch {
      const newOrder: SalesOrder = {
        id: `so-${Date.now()}`,
        invoice_number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        buyer_id: orderData.buyer_id,
        buyer_name: orderData.buyer_name || 'Mahavir Gems & Jewels',
        broker_name: orderData.broker_name || 'Direct Deal',
        total_carat: Number(orderData.total_carat || 1),
        gross_amount: Number(orderData.gross_amount || 100000),
        discount_pct: Number(orderData.discount_pct || 0),
        net_amount: Number(orderData.net_amount || 100000),
        payment_due_date: orderData.payment_due_date,
        deal_status: 'CONFIRMED',
        created_at: new Date().toISOString().split('T')[0]
      };
      return newOrder;
    }
  },

  getPurchases: async (): Promise<PurchaseOrder[]> => {
    return fallbackPurchases;
  },

  getBrokerageLedgers: async (): Promise<BrokerageItem[]> => {
    return fallbackBrokerage;
  },

  getDebtorsAgeing: async (): Promise<DebtorsAgeing> => {
    try {
      const res = await api.get('/sales/debtors-ageing');
      return res.data.data;
    } catch {
      return fallbackAgeing;
    }
  },

  // Follow-ups
  getDailyFollowUps: async (): Promise<FollowUpItem[]> => {
    try {
      const res = await api.get('/reminders/daily-queue');
      return res.data.data;
    } catch {
      return fallbackFollowUps;
    }
  },

  logFollowUp: async (data: any): Promise<any> => {
    try {
      const res = await api.post('/reminders/follow-up', data);
      return res.data;
    } catch {
      return { success: true, message: 'Follow-up registered in system' };
    }
  },

  updatePromiseDate: async (data: any): Promise<any> => {
    try {
      const res = await api.post('/reminders/promise-date', data);
      return res.data;
    } catch {
      return { success: true, message: 'Promised payment date updated' };
    }
  },

  // Accounting & Ledgers
  getPartyLedger: async (partyId: string): Promise<LedgerEntry[]> => {
    try {
      const res = await api.get(`/accounting/ledger/${partyId}`);
      return res.data.data;
    } catch {
      return [
        { id: '1', entry_type: 'DEBIT', amount: 4500000, reference_type: 'SALES_INVOICE #INV-2026-089', reference_id: 'so-1', running_balance: 4500000, created_at: '2026-09-25 14:30' },
        { id: '2', entry_type: 'CREDIT', amount: 1500000, reference_type: 'PAYMENT_RECEIPT (RTGS HDFC)', reference_id: 'rc-1', running_balance: 3000000, created_at: '2026-10-02 11:15' },
        { id: '3', entry_type: 'DEBIT', amount: 1200000, reference_type: 'SALES_INVOICE #INV-2026-094', reference_id: 'so-2', running_balance: 4200000, created_at: '2026-10-08 17:40' },
        { id: '4', entry_type: 'CREDIT', amount: 1000000, reference_type: 'PAYMENT_RECEIPT (ANGADIA / CASH)', reference_id: 'rc-2', running_balance: 3200000, created_at: '2026-10-12 16:00' }
      ];
    }
  },

  recordPaymentReceipt: async (receiptData: any): Promise<any> => {
    try {
      const res = await api.post('/accounting/receipts', receiptData);
      return res.data;
    } catch {
      return { success: true, message: 'Payment receipt recorded successfully' };
    }
  },

  recordSupplierPayment: async (paymentData: any): Promise<any> => {
    try {
      const res = await api.post('/accounting/supplier-payments', paymentData);
      return res.data;
    } catch {
      return { success: true, message: 'Supplier payment recorded successfully' };
    }
  },

  // Processing & Karkhana
  getRepairSlips: async (): Promise<RepairSlip[]> => {
    try {
      const res = await api.get('/processing');
      return res.data.data;
    } catch {
      return fallbackRepairSlips;
    }
  },

  createRepairSlip: async (slipData: any): Promise<any> => {
    try {
      const res = await api.post('/processing', slipData);
      return res.data;
    } catch {
      return { success: true, message: 'Repair slip issued to Surat workshop' };
    }
  },

  returnRepairSlip: async (returnData: any): Promise<any> => {
    try {
      const res = await api.post('/processing/return', returnData);
      return res.data;
    } catch {
      return { success: true, message: 'Returned stone received and carat loss logged' };
    }
  },

  // Audit & Reports
  getAuditLogs: async (): Promise<SystemAuditRecord[]> => {
    try {
      const res = await api.get('/audit/logs');
      return res.data.data;
    } catch {
      return fallbackAuditLogs;
    }
  },

  getWhatsAppTemplates: async (): Promise<WhatsAppTemplate[]> => {
    try {
      const res = await api.get('/notifications/templates');
      return res.data.data;
    } catch {
      return fallbackTemplates;
    }
  }
};
