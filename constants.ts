import { Store, User, UserRole, Voucher } from './types';

export const CATEGORIES = [
  'Gastronomia',
  'Moda',
  'Beleza & Spa',
  'Eletrônicos',
  'Casa & Decoração',
  'Entretenimento'
];

export const STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA'];

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@vp.ai', role: UserRole.ADMIN },
  { id: 'u2', name: 'João Silva', email: 'joao@loja.com', role: UserRole.STORE, storeId: 's1' },
  { id: 'u3', name: 'Maria Compradora', email: 'maria@gmail.com', role: UserRole.BUYER },
  { id: 'u4', name: 'Carla Zen', email: 'carla@spa.com', role: UserRole.STORE, storeId: 's2' },
  { id: 'u5', name: 'Roberto Tech', email: 'beto@tech.com', role: UserRole.STORE, storeId: 's3' },
];

// Mock Stores
export const MOCK_STORES: Store[] = [
  {
    id: 's1',
    name: 'Bistrô Sabor & Arte',
    description: 'Experiência gastronômica única com pratos autorais e ambiente acolhedor.',
    category: 'Gastronomia',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
    ],
    ownerId: 'u2',
    paymentConfig: { provider: 'PAGARME', apiKey: 'sk_test_...' },
    status: 'APPROVED',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 's2',
    name: 'Spa Zen Life',
    description: 'Massagens relaxantes, dia de noiva e tratamentos estéticos completos.',
    category: 'Beleza & Spa',
    city: 'Rio de Janeiro',
    state: 'RJ',
    images: [
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=5',
    ],
    ownerId: 'u4',
    paymentConfig: { provider: 'ASAAS', apiKey: '$aact_...' },
    status: 'APPROVED',
    createdAt: '2024-02-01T14:30:00Z'
  },
  {
    id: 's3',
    name: 'TechZone Electronics',
    description: 'O melhor da tecnologia: smartphones, notebooks e acessórios gamers.',
    category: 'Eletrônicos',
    city: 'Curitiba',
    state: 'PR',
    images: [
      'https://picsum.photos/800/600?random=6',
      'https://picsum.photos/800/600?random=7',
    ],
    ownerId: 'u5',
    paymentConfig: { provider: 'PAGARME', apiKey: 'sk_test_...' },
    status: 'APPROVED',
    createdAt: '2024-03-10T09:15:00Z'
  }
];

// Mock Vouchers
export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'VP-8X29-KLM',
    qrData: 'VP-8X29-KLM|s1|150.00',
    storeId: 's1',
    buyerId: 'u3',
    receiverName: 'Pedro Santos',
    amount: 150.00,
    message: 'Parabéns pelo seu aniversário! Aproveite o jantar.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    status: 'ACTIVE'
  },
  {
    id: 'v2',
    code: 'VP-99AA-BB2',
    qrData: 'VP-99AA-BB2|s1|50.00',
    storeId: 's1',
    buyerId: 'u3',
    receiverName: 'Ana Costa',
    amount: 50.00,
    message: 'Um mimo para você.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 20).toISOString(),
    status: 'REDEEMED'
  }
];