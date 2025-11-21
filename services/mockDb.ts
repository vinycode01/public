import { Store, User, Voucher, UserRole } from '../types';
import { MOCK_STORES, MOCK_USERS, MOCK_VOUCHERS, CATEGORIES as INITIAL_CATEGORIES } from '../constants';

// Helper to load from storage or use defaults
const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize state from LocalStorage or Mock Data
let stores: Store[] = loadFromStorage('vp_stores', [...MOCK_STORES]);
let users: User[] = loadFromStorage('vp_users', [...MOCK_USERS]);
let vouchers: Voucher[] = loadFromStorage('vp_vouchers', [...MOCK_VOUCHERS]);
let categories: string[] = loadFromStorage('vp_categories', [...INITIAL_CATEGORIES]);

export const db = {
  // Only return APPROVED stores for public listing
  getStores: () => stores.filter(s => s.status === 'APPROVED'),
  
  // Admin needs to see all stores
  getAllStores: () => [...stores], // Return copy

  getStoreById: (id: string) => stores.find(s => s.id === id),
  
  getUserById: (id: string) => users.find(u => u.id === id),
  
  // Dynamic Categories
  getCategories: () => categories,
  
  addCategory: (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      categories.push(newCategory);
      saveToStorage('vp_categories', categories);
    }
    return categories;
  },

  searchStores: (term: string, category?: string, state?: string) => {
    let results = stores.filter(s => s.status === 'APPROVED');
    if (category) results = results.filter(s => s.category === category);
    if (state) results = results.filter(s => s.state === state);
    if (term) {
      const lowerTerm = term.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(lowerTerm) || 
        s.description.toLowerCase().includes(lowerTerm) ||
        s.city.toLowerCase().includes(lowerTerm)
      );
    }
    return results;
  },

  login: (email: string): User | undefined => {
    return users.find(u => u.email === email);
  },

  // Store Registration
  registerStore: (
    storeData: Omit<Store, 'id' | 'ownerId' | 'status' | 'createdAt' | 'paymentConfig'>, 
    ownerData: { name: string, email: string }
  ) => {
    // 1. Create User
    const newUserId = `u${Date.now()}`;
    const newStoreId = `s${Date.now()}`;
    
    const newUser: User = {
      id: newUserId,
      name: ownerData.name,
      email: ownerData.email,
      role: UserRole.STORE,
      storeId: newStoreId
    };
    
    // 2. Create Store (Pending)
    const newStore: Store = {
      ...storeData,
      id: newStoreId,
      ownerId: newUserId,
      status: 'PENDING', // Default status
      createdAt: new Date().toISOString(),
      paymentConfig: { provider: 'PAGARME', apiKey: '' } // Empty initially
    };

    users = [...users, newUser];
    stores = [...stores, newStore];
    
    saveToStorage('vp_users', users);
    saveToStorage('vp_stores', stores);

    return { user: newUser, store: newStore };
  },

  // Store Updates (Images)
  updateStoreImages: (storeId: string, images: string[]) => {
    const storeIndex = stores.findIndex(s => s.id === storeId);
    if (storeIndex !== -1) {
      const updatedStore = { ...stores[storeIndex], images };
      stores = stores.map(s => s.id === storeId ? updatedStore : s);
      saveToStorage('vp_stores', stores);
      return updatedStore;
    }
    return null;
  },

  // Admin Actions
  updateStoreStatus: (storeId: string, status: 'APPROVED' | 'REJECTED') => {
    stores = stores.map(s => s.id === storeId ? { ...s, status } : s);
    saveToStorage('vp_stores', stores);
    return stores.find(s => s.id === storeId);
  },

  createVoucher: (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'status' | 'code' | 'qrData'>) => {
    const id = `v${Date.now()}`;
    const code = `VP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newVoucher: Voucher = {
      ...voucherData,
      id,
      code,
      qrData: `${code}|${voucherData.storeId}|${voucherData.amount}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    vouchers = [...vouchers, newVoucher];
    saveToStorage('vp_vouchers', vouchers);
    return newVoucher;
  },

  getVouchersByBuyer: (buyerId: string) => vouchers.filter(v => v.buyerId === buyerId),
  
  getVouchersByStore: (storeId: string) => vouchers.filter(v => v.storeId === storeId),
  
  getAllVouchers: () => vouchers, // For admin

  redeemVoucher: (code: string, storeId: string) => {
    const voucher = vouchers.find(v => v.code === code && v.storeId === storeId);
    if (!voucher) return { success: false, message: 'Voucher não encontrado ou loja incorreta.' };
    if (voucher.status !== 'ACTIVE') return { success: false, message: `Voucher inválido. Status: ${voucher.status}` };
    
    // Update status
    voucher.status = 'REDEEMED';
    vouchers = vouchers.map(v => v.id === voucher.id ? { ...v, status: 'REDEEMED' } : v);
    saveToStorage('vp_vouchers', vouchers);
    
    return { success: true, message: 'Voucher resgatado com sucesso!', voucher };
  },
  
  // Reset Data (Utility for testing)
  resetDb: () => {
    localStorage.clear();
    window.location.reload();
  }
};