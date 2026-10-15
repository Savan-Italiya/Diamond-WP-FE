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
  User,
  Organization,
  OrganizationMember,
  SmsLog
} from '../types';

const TOKEN_KEY = 'diamond_erp_jwt_token';
const USER_KEY = 'diamond_erp_user_profile';

export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const DiamondApi = {
  // ─────────────── AUTH ───────────────
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { token, user };
  },

  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // ─────────────── INVENTORY ───────────────
  getStockSummary: async (): Promise<StockSummary> => {
    const res = await api.get('/inventory/summary');
    return res.data.data;
  },

  getLots: async (): Promise<DiamondLot[]> => {
    const res = await api.get('/inventory/lots');
    return res.data.data ?? [];
  },

  createLot: async (lotData: any): Promise<DiamondLot> => {
    const res = await api.post('/inventory/lots', lotData);
    return res.data.data;
  },

  getSingleDiamonds: async (): Promise<SingleDiamond[]> => {
    const res = await api.get('/inventory/diamonds');
    return res.data.data ?? [];
  },

  createSingleDiamond: async (diamondData: any): Promise<SingleDiamond> => {
    const res = await api.post('/inventory/diamonds', diamondData);
    return res.data.data;
  },

  breakdownLot: async (breakdownData: {
    parent_lot_id: string;
    new_lot_number?: string;
    child_lot_number?: string;
    carats_transferred: number;
    cost_per_carat?: number;
  }): Promise<any> => {
    const payload = {
      parent_lot_id: breakdownData.parent_lot_id,
      new_lot_number: breakdownData.new_lot_number || breakdownData.child_lot_number,
      carats_transferred: breakdownData.carats_transferred,
      cost_per_carat: breakdownData.cost_per_carat
    };
    const res = await api.post('/inventory/lots/breakdown', payload);
    return res.data;
  },

  stockAudit: async (auditData: any): Promise<any> => {
    const res = await api.post('/inventory/audit', auditData);
    return res.data;
  },

  // ─────────────── MEMO ───────────────
  getMemos: async (): Promise<MemoBill[]> => {
    const res = await api.get('/memo');
    return res.data.data ?? [];
  },

  createMemo: async (memoData: any): Promise<MemoBill> => {
    const res = await api.post('/memo', memoData);
    return res.data.data;
  },

  returnMemoItem: async (returnData: any): Promise<any> => {
    const res = await api.post('/memo/return', returnData);
    return res.data;
  },

  // ─────────────── PARTIES ───────────────
  getParties: async (): Promise<Party[]> => {
    const res = await api.get('/parties');
    return res.data.data ?? [];
  },

  createParty: async (partyData: any): Promise<Party> => {
    const res = await api.post('/parties', partyData);
    return res.data.data;
  },

  // ─────────────── SALES ───────────────
  getSalesOrders: async (filters?: { deal_status?: string }): Promise<SalesOrder[]> => {
    const params = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    const res = await api.get(`/sales${params}`);
    return res.data.data ?? [];
  },

  createSalesOrder: async (orderData: any): Promise<SalesOrder> => {
    const res = await api.post('/sales', orderData);
    return res.data.data;
  },

  markInvoicePaid: async (salesOrderId: string): Promise<any> => {
    const res = await api.post(`/sales/${salesOrderId}/mark-paid`);
    return res.data.data;
  },

  recordPartialPayment: async (data: {
    sales_order_id: string;
    amount_received: number;
    payment_mode: string;
    payment_reference?: string;
    next_promise_date?: string;
    remarks?: string;
  }): Promise<any> => {
    const res = await api.post(`/sales/${data.sales_order_id}/partial-payment`, data);
    return res.data.data;
  },

  reschedulePayment: async (data: {
    sales_order_id: string;
    new_promised_date: string;
    reason?: string;
  }): Promise<any> => {
    const res = await api.post(`/sales/${data.sales_order_id}/reschedule`, data);
    return res.data.data;
  },

  getPaymentHistory: async (salesOrderId: string): Promise<any> => {
    const res = await api.get(`/sales/${salesOrderId}/payments`);
    return res.data.data;
  },

  getPurchases: async (): Promise<PurchaseOrder[]> => {
    // Purchase orders come from the purchases/bills endpoint (no dedicated route yet → return empty)
    try {
      const res = await api.get('/purchases');
      return res.data.data ?? [];
    } catch { return []; }
  },

  getBrokerageLedgers: async (): Promise<BrokerageItem[]> => {
    try {
      const res = await api.get('/accounting/brokerage');
      return res.data.data ?? [];
    } catch { return []; }
  },

  getDebtorsAgeing: async (): Promise<DebtorsAgeing> => {
    const res = await api.get('/sales/debtors-ageing');
    return res.data.data;
  },

  // ─────────────── FOLLOW-UPS & REMINDERS ───────────────
  getDailyFollowUps: async (): Promise<FollowUpItem[]> => {
    const res = await api.get('/reminders/daily-queue');
    return res.data.data ?? [];
  },

  logFollowUp: async (data: any): Promise<any> => {
    const res = await api.post('/reminders/follow-up', data);
    return res.data;
  },

  updatePromiseDate: async (data: any): Promise<any> => {
    const res = await api.post('/reminders/promise-date', data);
    return res.data;
  },

  // ─────────────── ACCOUNTING / LEDGER ───────────────
  getPartyLedger: async (partyId: string): Promise<LedgerEntry[]> => {
    const res = await api.get(`/accounting/ledger/${partyId}`);
    return res.data.data ?? [];
  },

  recordPaymentReceipt: async (receiptData: any): Promise<any> => {
    const res = await api.post('/accounting/receipts', receiptData);
    return res.data;
  },

  recordSupplierPayment: async (paymentData: any): Promise<any> => {
    const res = await api.post('/accounting/supplier-payments', paymentData);
    return res.data;
  },

  // ─────────────── PROCESSING ───────────────
  getRepairSlips: async (): Promise<RepairSlip[]> => {
    const res = await api.get('/processing');
    return res.data.data ?? [];
  },

  createRepairSlip: async (slipData: any): Promise<any> => {
    const res = await api.post('/processing', slipData);
    return res.data;
  },

  returnRepairSlip: async (returnData: any): Promise<any> => {
    const res = await api.post('/processing/return', returnData);
    return res.data;
  },

  // ─────────────── AUDIT & NOTIFICATIONS ───────────────
  getAuditLogs: async (): Promise<SystemAuditRecord[]> => {
    const res = await api.get('/audit/logs');
    return res.data.data ?? [];
  },

  getWhatsAppTemplates: async (): Promise<WhatsAppTemplate[]> => {
    const res = await api.get('/notifications/templates');
    return res.data.data ?? [];
  },

  // ─────────────── DASHBOARD STATS ───────────────
  getMySalesStats: async (): Promise<{
    today_count: number;
    today_amount: number;
    month_count: number;
    month_amount: number;
    total_pending: number;
  }> => {
    try {
      const res = await api.get('/sales/my-stats');
      return res.data.data;
    } catch {
      // compute from all sales if endpoint doesn't exist yet
      const all = await DiamondApi.getSalesOrders();
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.substring(0, 7);
      const todaySales = all.filter((s) => s.created_at?.startsWith(today));
      const monthSales = all.filter((s) => s.created_at?.startsWith(thisMonth));
      const pending = all.filter((s) => !['PAID', 'SETTLED'].includes(s.deal_status));
      return {
        today_count: todaySales.length,
        today_amount: todaySales.reduce((sum, s) => sum + Number(s.net_amount), 0),
        month_count: monthSales.length,
        month_amount: monthSales.reduce((sum, s) => sum + Number(s.net_amount), 0),
        total_pending: pending.reduce((sum, s) => sum + Number(s.net_amount), 0)
      };
    }
  },

  // ─────────────── ORGANIZATIONS & MULTI-USER ───────────────
  getMyOrganization: async (): Promise<Organization> => {
    const res = await api.get('/organizations/my');
    return res.data.data;
  },

  createOrUpdateOrganization: async (orgData: {
    name: string;
    registration_number?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
  }): Promise<Organization> => {
    const res = await api.post('/organizations', orgData);
    return res.data.data;
  },

  getOrganizationMembers: async (): Promise<OrganizationMember[]> => {
    const res = await api.get('/organizations/members');
    return res.data.data ?? [];
  },

  addOrganizationMember: async (memberData: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: string;
    user_scope: string;
  }): Promise<OrganizationMember> => {
    const res = await api.post('/organizations/members', memberData);
    return res.data.data;
  },

  updateMemberStatus: async (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'): Promise<any> => {
    const res = await api.patch(`/organizations/members/${userId}/status`, { status });
    return res.data.data;
  },

  // ─────────────── SMS NOTIFICATIONS ───────────────
  sendSmsNotification: async (data: {
    party_id?: string;
    phone: string;
    message: string;
    reference_type?: string;
    reference_id?: string;
  }): Promise<any> => {
    const res = await api.post('/notifications/send-sms', data);
    return res.data;
  },

  getSmsLogs: async (partyId?: string): Promise<SmsLog[]> => {
    const params = partyId ? `?party_id=${partyId}` : '';
    const res = await api.get(`/notifications/sms-logs${params}`);
    return res.data.data ?? [];
  },

  // ─────────────── EXPENSES / KHARCHA ───────────────
  getExpenses: async (filters?: { from_date?: string; to_date?: string; category?: string }): Promise<any[]> => {
    const params = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    try { const res = await api.get(`/expenses${params}`); return res.data.data ?? []; }
    catch { return []; }
  },

  createExpense: async (data: {
    category: string;
    description: string;
    amount: number;
    paid_to?: string;
    payment_mode?: string;
    expense_date?: string;
  }): Promise<any> => {
    const res = await api.post('/expenses', data);
    return res.data.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  getExpenseSummary: async (filters?: { from_date?: string; to_date?: string }): Promise<any> => {
    const params = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    try { const res = await api.get(`/expenses/summary${params}`); return res.data.data; }
    catch { return { by_category: [], grand_total: 0 }; }
  },

  // ─────────────── FOLLOW-UP HISTORY & DONE ───────────────
  getFollowUpHistory: async (partyId?: string): Promise<any[]> => {
    const params = partyId ? `?party_id=${partyId}` : '';
    try { const res = await api.get(`/reminders/history${params}`); return res.data.data ?? []; }
    catch { return []; }
  },

  markCallDone: async (scheduleId: string, data: {
    resolution: string;
    note?: string;
    next_date?: string;
  }): Promise<any> => {
    const res = await api.post(`/reminders/${scheduleId}/done`, data);
    return res.data.data;
  },

  // ─────────────── DASHBOARD STATS ───────────────
  getDashboardStats: async (): Promise<any> => {
    try { const res = await api.get('/reminders/dashboard-stats'); return res.data.data; }
    catch { return null; }
  }
};
