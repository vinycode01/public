export enum UserRole {
  ADMIN = 'ADMIN',
  STORE = 'STORE',
  BUYER = 'BUYER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string; // Linked if role is STORE
}

export interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  images: string[];
  ownerId: string;
  paymentConfig: {
    provider: 'ASAAS' | 'PAGARME';
    apiKey: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string; // Unique human readable code
  qrData: string;
  storeId: string;
  buyerId: string;
  receiverName: string;
  amount: number;
  message: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}

export interface Transaction {
  id: string;
  storeId: string;
  amount: number;
  date: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface DashboardStats {
  totalRevenue: number;
  activeVouchers: number;
  redeemedVouchers: number;
  recentTransactions: Transaction[];
}