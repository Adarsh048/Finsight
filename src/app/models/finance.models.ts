export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'cleared' | 'pending';
export type UserRole = 'admin' | 'viewer';
export type PageType = 'dashboard' | 'transactions' | 'analytics' | 'reports' | 'integrations';
export type TimeRange = '7D' | '1M' | '3M';
export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  note?: string;
}

export interface ConnectionNode {
  id: string;
  name: string;
  type: string;
  protocol: string;
  ping: string;
  status: 'connected' | 'disconnected';
  lastSync?: string | null;
  icon: string;
}

export interface CategorySummary {
  name: string;
  value: number;
}

export interface DailyBalance {
  date: string;
  balance: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}
