import axios from 'axios';
import { StockSummary, DiamondLot, SingleDiamond, DebtorsAgeing, FollowUpItem, MemoBill } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock Fallback Data (Mumbai BKC & Opera House real profiles)
const fallbackStockSummary: StockSummary = {
  lots: {
    total_lots: 24,
    total_carats: 842.65,
    total_valuation_inr: 284500000
  },
  solitaires: {
    total_solitaires: 56,
    total_carats: 112.4
  },
  aggregated_carats: 955.05,
  timestamp: new Date().toISOString()
};

const fallbackLots: DiamondLot[] = [
  { id: '1', lot_number: 'LOT-BKC-2026-001', category_name: 'PARCEL_LOT', total_carat: 125.5, current_carat: 125.5, cost_per_carat: 28500, purchase_date: '2026-09-15', status: 'IN_STOCK' },
  { id: '2', lot_number: 'LOT-BKC-2026-002', category_name: 'SOLITAIRE', total_carat: 3.52, current_carat: 3.52, cost_per_carat: 450000, purchase_date: '2026-10-01', status: 'IN_STOCK' },
  { id: '3', lot_number: 'LOT-SURAT-PARCHA-09', category_name: 'ROUGH', total_carat: 240.0, current_carat: 180.5, cost_per_carat: 19500, purchase_date: '2026-08-20', status: 'IN_PROCESS' },
  { id: '4', lot_number: 'LOT-OPERA-EX-004', category_name: 'POLISHED', total_carat: 88.0, current_carat: 12.0, cost_per_carat: 34000, purchase_date: '2026-07-11', status: 'MEMO' }
];

const fallbackDiamonds: SingleDiamond[] = [
  { id: 'd-1', cert_type: 'GIA', cert_number: '2234567891', shape: 'ROUND', carat: 1.51, color: 'D', clarity: 'VVS1', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'IN_STOCK' },
  { id: 'd-2', cert_type: 'GIA', cert_number: '5567891234', shape: 'OVAL', carat: 2.01, color: 'E', clarity: 'VS1', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'VERY_GOOD', fluorescence: 'FAINT', status: 'IN_STOCK' },
  { id: 'd-3', cert_type: 'IGI', cert_number: '489120334', shape: 'PEAR', carat: 3.15, color: 'F', clarity: 'VVS2', cut: 'EXCELLENT', polish: 'VERY_GOOD', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'MEMO' },
  { id: 'd-4', cert_type: 'HRD', cert_number: '882190012', shape: 'EMERALD', carat: 2.54, color: 'D', clarity: 'IF', cut: 'EXCELLENT', polish: 'EXCELLENT', symmetry: 'EXCELLENT', fluorescence: 'NONE', status: 'IN_STOCK' }
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
    whatsapp_app_url: 'whatsapp://send?phone=919820011444&text=Pranam%20Maheshbhai%20ji%2C%20gentle%20reminder%20regarding%20overdue%20invoice%20INV-2026-022.',
    whatsapp_web_url: 'https://api.whatsapp.com/send?phone=919820011444&text=Pranam%20Maheshbhai%20ji%2C%20gentle%20reminder%20regarding%20overdue%20invoice%20INV-2026-022.'
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
    whatsapp_app_url: 'whatsapp://send?phone=919820112233&text=Pranam%20Kamleshbhai%20ji%2C%20gentle%20reminder%20regarding%20invoice%20INV-2026-051.',
    whatsapp_web_url: 'https://api.whatsapp.com/send?phone=919820112233&text=Pranam%20Kamleshbhai%20ji%2C%20gentle%20reminder%20regarding%20invoice%20INV-2026-051.'
  }
];

export const DiamondApi = {
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

  getSingleDiamonds: async (): Promise<SingleDiamond[]> => {
    try {
      const res = await api.get('/inventory/diamonds');
      return res.data.data;
    } catch {
      return fallbackDiamonds;
    }
  },

  getDebtorsAgeing: async (): Promise<DebtorsAgeing> => {
    try {
      const res = await api.get('/sales/debtors-ageing');
      return res.data.data;
    } catch {
      return fallbackAgeing;
    }
  },

  getDailyFollowUps: async (): Promise<FollowUpItem[]> => {
    try {
      const res = await api.get('/reminders/daily-queue');
      return res.data.data;
    } catch {
      return fallbackFollowUps;
    }
  },

  getMemos: async (): Promise<MemoBill[]> => {
    try {
      const res = await api.get('/memo');
      return res.data.data;
    } catch {
      return [
        {
          id: 'm-1',
          memo_number: 'MEMO-BKC-991',
          party_name: 'Mahavir Gems & Jewels',
          party_phone: '+919820123456',
          broker_name: 'Kothari Broking House',
          memo_type: 'MEMO_GIVEN',
          issue_date: '2026-10-10',
          return_due_date: '2026-10-17',
          status: 'OPEN',
          items: [{ id: 'mi-1', carat: 1.51, asking_price: 520000, status: 'WITH_PARTY' }]
        }
      ];
    }
  }
};
