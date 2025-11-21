import { createClient } from '@supabase/supabase-js';
import { Store, User, Voucher, UserRole } from '../types';

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://ueuaeinnkgypykfswsgk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldWFlaW5ua2d5cHlrZnN3c2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjEwOTUsImV4cCI6MjA3OTA5NzA5NX0.-CXFDZiA-N6sbYBvglF_HnoBdD2luk28wWE50Q1ViOY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- FUNÇÕES AUXILIARES DE MAPEAMENTO ---
const mapStore = (s: any): Store => ({
  id: s.id,
  name: s.name,
  description: s.description,
  category: s.category,
  city: s.city,
  state: s.state,
  images: s.images || [],
  ownerId: s.owner_id,
  paymentConfig: s.payment_config || { provider: 'ASAAS', apiKey: '' },
  status: s.status,
  createdAt: s.created_at
});

const mapUser = (u: any): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role as UserRole,
  storeId: u.store_id
});

const mapVoucher = (v: any): Voucher => ({
  id: v.id,
  code: v.code,
  qrData: v.qr_data,
  storeId: v.store_id,
  buyerId: v.buyer_id,
  receiverName: v.receiver_name,
  amount: v.amount,
  message: v.message,
  createdAt: v.created_at,
  expiresAt: v.expires_at,
  status: v.status
});

// --- API SERVICE ---

export const api = {
  
  // Lojas
  getStores: async (statusFilter?: string) => {
    let query = supabase.from('stores').select('*');
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Erro ao buscar lojas:", error);
      return [];
    }
    return (data || []).map(mapStore);
  },

  getStoreById: async (id: string) => {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapStore(data);
  },

  updateStoreStatus: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const { error } = await supabase.from('stores').update({ status }).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
    return true;
  },

  // Admin: Editar dados da loja
  updateStoreData: async (id: string, updates: Partial<Store>) => {
    const { error } = await supabase.from('stores').update({
      name: updates.name,
      description: updates.description,
      category: updates.category,
      city: updates.city,
      state: updates.state,
      status: updates.status
    }).eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Admin: Excluir loja (e limpar vouchers órfãos)
  deleteStore: async (id: string) => {
    // 1. Primeiro exclui vouchers associados para evitar erro de FK
    await supabase.from('vouchers').delete().eq('store_id', id);
    
    // 2. Exclui a loja
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) throw error;
    
    return true;
  },

  updateStoreImages: async (id: string, images: string[]) => {
    const { error } = await supabase.from('stores').update({ images }).eq('id', id);
    if (error) throw error;
    return true;
  },

  updateStorePaymentConfig: async (id: string, apiKey: string) => {
    const config = { provider: 'ASAAS', apiKey };
    const { error } = await supabase.from('stores').update({ payment_config: config }).eq('id', id);
    if (error) throw error;
    return true;
  },

  // Usuários e Autenticação
  login: async (email: string, password?: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !data) return undefined; 
    
    // AUTO-REPARO
    if (!data.password && password) {
      const { error: updateError } = await supabase.from('users').update({ password: password }).eq('id', data.id);
      if (updateError && updateError.code === 'PGRST204') return mapUser(data); // Fallback
      if (updateError) throw new Error(`Erro ao configurar segurança.`);
      return mapUser(data);
    }

    if (data.password !== password) throw new Error("Senha incorreta.");
    return mapUser(data);
  },

  getUserById: async (id: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  requestPasswordReset: async (email: string) => {
    // Simula o envio de email (em produção usaria supabase.auth.resetPasswordForEmail ou backend próprio)
    const { data } = await supabase.from('users').select('email').eq('email', email).single();
    if (!data) throw new Error("Email não encontrado.");
    return true; 
  },

  registerBuyer: async (name: string, email: string) => {
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
    if (existing) return mapUser(existing);

    const id = `u${Date.now()}`;
    const { error } = await supabase.from('users').insert({ id, name, email, role: 'BUYER' });
    if (error) throw error;
    return { id, name, email, role: UserRole.BUYER } as User;
  },

  registerStore: async (
    storeData: Omit<Store, 'id' | 'ownerId' | 'status' | 'createdAt' | 'paymentConfig'>,
    ownerData: { name: string, email: string, password?: string }
  ) => {
    const userId = `u${Date.now()}`;
    const storeId = `s${Date.now()}`;

    let userPayload: any = {
      id: userId,
      name: ownerData.name,
      email: ownerData.email,
      password: ownerData.password,
      role: 'STORE',
      store_id: storeId
    };

    let { error: uError } = await supabase.from('users').insert(userPayload);
    if (uError && uError.code === 'PGRST204') {
       delete userPayload.password;
       const retry = await supabase.from('users').insert(userPayload);
       uError = retry.error;
    }
    if (uError) throw uError;

    const { error: sError } = await supabase.from('stores').insert({
      id: storeId,
      name: storeData.name,
      description: storeData.description,
      category: storeData.category,
      city: storeData.city,
      state: storeData.state,
      images: storeData.images,
      owner_id: userId,
      status: 'PENDING',
      payment_config: { provider: 'ASAAS', apiKey: '' }
    });

    if (sError) {
      await supabase.from('users').delete().eq('id', userId);
      throw sError;
    }

    return {
      user: { id: userId, ...ownerData, role: UserRole.STORE, storeId } as User,
      store: { id: storeId, ...storeData, status: 'PENDING' } as Store
    };
  },

  // Vouchers
  createVoucher: async (voucherData: Omit<Voucher, 'id' | 'createdAt' | 'status' | 'code' | 'qrData'>) => {
    const id = `v${Date.now()}`;
    const code = `VP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const qrData = `${code}|${voucherData.storeId}|${voucherData.amount}`;

    const { error } = await supabase.from('vouchers').insert({
      id,
      code,
      qr_data: qrData,
      store_id: voucherData.storeId,
      buyer_id: voucherData.buyerId,
      receiver_name: voucherData.receiverName,
      amount: voucherData.amount,
      message: voucherData.message,
      status: 'ACTIVE',
      expires_at: voucherData.expiresAt
    });

    if (error) throw error;
    return { id, code, qrData, ...voucherData, status: 'ACTIVE' } as Voucher;
  },

  getVouchersByBuyer: async (buyerId: string) => {
    const { data } = await supabase.from('vouchers').select('*').eq('buyer_id', buyerId);
    return (data || []).map(mapVoucher);
  },

  getVouchersByStore: async (storeId: string) => {
    const { data } = await supabase.from('vouchers').select('*').eq('store_id', storeId);
    return (data || []).map(mapVoucher);
  },

  getAllVouchers: async () => {
    const { data } = await supabase.from('vouchers').select('*');
    return (data || []).map(mapVoucher);
  },

  redeemVoucher: async (code: string, storeId: string) => {
    const { data: voucher, error } = await supabase.from('vouchers').select('*').eq('code', code).eq('store_id', storeId).single();
    if (error || !voucher) return { success: false, message: 'Voucher não encontrado.' };
    if (voucher.status !== 'ACTIVE') return { success: false, message: `Status inválido: ${voucher.status}` };

    const { error: updateError } = await supabase.from('vouchers').update({ status: 'REDEEMED' }).eq('id', voucher.id);
    if (updateError) return { success: false, message: 'Erro ao atualizar.' };
    return { success: true, message: 'Voucher resgatado com sucesso!' };
  },

  // --- INTEGRAÇÃO REAL COM ASAAS VIA PROXY (Para evitar bloqueio de navegador) ---
  // Nota: Usamos 'https://corsproxy.io/?' para permitir a requisição sem backend.
  
  createRealAsaasCharge: async (apiKey: string, amount: number, description: string, customerData: { name: string, email: string, cpf: string }) => {
    if (!apiKey) throw new Error("A loja não configurou a chave API do Asaas.");
    
    const PROXY_URL = "https://corsproxy.io/?";
    const BASE_URL = "https://www.asaas.com/api/v3"; 

    try {
        // 1. Criar ou Buscar Cliente no Asaas
        const customerId = await api.createAsaasCustomer(apiKey, customerData);

        // 2. Criar Cobrança PIX
        const chargeRes = await fetch(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/payments`)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey
            },
            body: JSON.stringify({
                customer: customerId,
                billingType: 'PIX',
                value: amount,
                dueDate: new Date().toISOString().split('T')[0],
                description: description
            })
        });

        if (!chargeRes.ok) {
            const err = await chargeRes.json();
            throw new Error(err.errors?.[0]?.description || "Erro ao criar cobrança no Asaas");
        }

        const chargeData = await chargeRes.json();
        
        // 3. Pegar o Payload do QR Code (Copia e Cola)
        const qrRes = await fetch(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/payments/${chargeData.id}/pixQrCode`)}`, {
             method: 'GET',
             headers: { 'access_token': apiKey }
        });
        
        if (!qrRes.ok) throw new Error("Erro ao gerar QR Code Pix");
        
        const qrData = await qrRes.json();

        return { 
            success: true, 
            invoiceUrl: chargeData.invoiceUrl, 
            pixCode: qrData.payload, // O Código Copia e Cola REAL
            encodedImage: qrData.encodedImage, // Imagem Base64 do QR Code REAL
            isSimulation: true // Mantemos como 'simulação' apenas para ativar o Modal interno
        };

    } catch (e: any) {
        console.error("Erro Asaas:", e);
        throw new Error(`Falha no pagamento Asaas: ${e.message}`);
    }
  },

  createAsaasCustomer: async (apiKey: string, data: { name: string, email: string, cpf: string }) => {
    const PROXY_URL = "https://corsproxy.io/?";
    const BASE_URL = "https://www.asaas.com/api/v3";

    // Tenta criar cliente
    const res = await fetch(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/customers`)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': apiKey
        },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpf 
        })
    });

    const json = await res.json();

    // Se já existe, o Asaas retorna erro 400 mas a gente pode buscar pelo email
    if (!res.ok) {
         if (json.errors?.[0]?.code === 'CUSTOMER_EMAIL_ALREADY_EXISTS' || json.errors?.[0]?.code === 'CUSTOMER_CPF_CNPJ_ALREADY_EXISTS') {
             // Buscar cliente existente
             const searchRes = await fetch(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/customers?email=${data.email}`)}`, {
                 headers: { 'access_token': apiKey }
             });
             const searchJson = await searchRes.json();
             if (searchJson.data && searchJson.data.length > 0) {
                 return searchJson.data[0].id;
             }
         }
         throw new Error(json.errors?.[0]?.description || "Erro ao cadastrar cliente no Asaas");
    }

    return json.id;
  },

  // Categorias
  getCategories: async () => {
    const { data } = await supabase.from('categories').select('name').order('name');
    return (data || []).map((c: any) => c.name);
  },

  addCategory: async (name: string) => {
    const { error } = await supabase.from('categories').insert({ name });
    if (error) throw error;
    return true;
  },

  updateCategory: async (oldName: string, newName: string) => {
    // 1. Atualiza a tabela de categorias
    const { error } = await supabase.from('categories').update({ name: newName }).eq('name', oldName);
    if (error) throw error;
    
    // 2. Atualiza todas as lojas que usavam a categoria antiga (Opcional mas recomendado)
    // Como 'category' na tabela stores é apenas texto, precisamos atualizar lá também para não quebrar filtros
    await supabase.from('stores').update({ category: newName }).eq('category', oldName);
    
    return true;
  },

  deleteCategory: async (name: string) => {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    if (error) throw error;
    return true;
  },

  // Estados
  getStates: async () => {
    const { data, error } = await supabase.from('states').select('code').order('code');
    if (error) return ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'GO']; 
    return (data || []).map((s: any) => s.code);
  },

  addState: async (code: string) => {
    const { error } = await supabase.from('states').insert({ code });
    if (error) throw error;
    return true;
  },

  deleteState: async (code: string) => {
    const { error } = await supabase.from('states').delete().eq('code', code);
    if (error) throw error;
    return true;
  }
};