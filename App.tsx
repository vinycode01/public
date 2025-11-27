import React, { useState, useEffect } from 'react';

// --- Footer Component ---

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>
          Direitos reservados |{' '}
          <a 
            href="https://wa.me/5511999190904" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            WhatsApp: (11) 99919-0904
          </a>
        </p>
      </div>
    </footer>
  );
};
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { User, UserRole, Store, Voucher } from './types';
import { api } from './services/api';
import { generateGiftMessage } from './services/geminiService';
import { 
  LayoutDashboard, ShoppingBag, Store as StoreIcon, LogOut, Search, Gift, MapPin, CreditCard, 
  QrCode, CheckCircle, XCircle, Sparkles, Menu, X, Users, AlertCircle, ChevronRight, 
  Ban, Check, Eye, ExternalLink, Plus, Image as ImageIcon, Trash2, Settings, Upload, Loader2, DollarSign, Share2,
  Navigation, Save, Copy, BarChart3, PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import QRCode from "react-qr-code";
import { STATES as DEFAULT_STATES } from './constants';

// --- Helpers ---

const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  return error?.message || error?.error_description || 'Ocorreu um erro desconhecido. Tente novamente.';
};

const prepareChartData = (vouchers: Voucher[]) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });

  const data = last7Days.map(date => {
    const dayVouchers = vouchers.filter(v => new Date(v.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) === date);
    return {
      name: date,
      vendas: dayVouchers.reduce((acc, v) => acc + Number(v.amount), 0),
      qtd: dayVouchers.length
    };
  });
  return data;
};

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-2xl">
              <Gift className="w-8 h-8" />
              <span>ValePresente.Shop</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium">Lojas</Link>
            {!user && (
              <>
                <Link to="/register-store" className="text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium">Seja Parceiro</Link>
                <Link to="/login" className="text-brand-600 hover:text-brand-700 px-3 py-2 rounded-md text-sm font-medium">Entrar</Link>
              </>
            )}
            {user && user.role === UserRole.BUYER && (
              <Link to="/dashboard/buyer" className="flex items-center gap-1 text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium"><ShoppingBag size={18} /> Meus Vouchers</Link>
            )}
            {user && user.role === UserRole.STORE && (
              <Link to="/dashboard/store" className="flex items-center gap-1 text-gray-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium"><LayoutDashboard size={18} /> Painel da Loja</Link>
            )}
            {user && user.role === UserRole.ADMIN && (
              <Link to="/dashboard/admin" className="flex items-center gap-1 text-brand-600 bg-brand-50 px-3 py-2 rounded-md text-sm font-medium"><LayoutDashboard size={18} /> Painel Admin</Link>
            )}
            {user && (
              <button onClick={onLogout} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"><LogOut size={16} /> Sair</button>
            )}
          </div>
           <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-brand-600">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2 space-y-2 shadow-lg">
             <Link to="/" className="block text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>Lojas</Link>
             {!user && (
               <>
                 <Link to="/register-store" className="block text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>Seja Parceiro</Link>
                 <Link to="/login" className="block text-brand-600 font-bold py-2" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
               </>
             )}
             {user && (
                <>
                  {user.role === UserRole.BUYER && <Link to="/dashboard/buyer" className="block text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>Meus Vouchers</Link>}
                  {user.role === UserRole.STORE && <Link to="/dashboard/store" className="block text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>Painel da Loja</Link>}
                  {user.role === UserRole.ADMIN && <Link to="/dashboard/admin" className="block text-gray-600 py-2" onClick={() => setIsMenuOpen(false)}>Painel Admin</Link>}
                  <button onClick={onLogout} className="block w-full text-left text-red-500 py-2">Sair</button>
                </>
             )}
        </div>
      )}
    </nav>
  );
};

const StoreCard: React.FC<{ store: Store }> = ({ store }) => {
  return (
    <Link to={`/store/${store.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <div className="h-48 overflow-hidden relative bg-gray-100">
        {store.images && store.images.length > 0 ? (
          <img src={store.images[0]} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700 shadow-sm">
          {store.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">{store.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          {store.city}, {store.state}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 flex-grow mb-4">{store.description}</p>
        <div className="mt-auto pt-2">
           <button className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]">
             <Gift size={20} /> Presentear
           </button>
        </div>
      </div>
    </Link>
  );
};

const StoreDetailsModal = ({ store, isOpen, onClose }: { store: Store | null, isOpen: boolean, onClose: () => void }) => {
  const [owner, setOwner] = useState<User | undefined>(undefined);
  
  useEffect(() => {
    if (store) {
      api.getUserById(store.ownerId).then(setOwner);
    }
  }, [store]);

  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Detalhes da Loja</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start gap-4">
            {store.images[0] ? 
              <img src={store.images[0]} alt={store.name} className="w-24 h-24 rounded-lg object-cover border border-gray-200" /> :
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="text-gray-400"/></div>
            }
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{store.category}</span>
                <span>•</span>
                <span>{store.city}, {store.state}</span>
              </div>
              <div className="mt-2">
                 {store.status === 'APPROVED' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> Aprovada</span>}
                 {store.status === 'PENDING' && <span className="text-yellow-600 font-bold text-sm flex items-center gap-1"><AlertCircle size={14}/> Pendente</span>}
                 {store.status === 'REJECTED' && <span className="text-red-600 font-bold text-sm flex items-center gap-1"><XCircle size={14}/> Recusada</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-3">
               <h4 className="font-semibold text-gray-900 border-b pb-1">Informações do Proprietário</h4>
               <div className="text-sm space-y-2">
                 <p><span className="text-gray-500">Nome:</span> {owner?.name || 'Carregando...'}</p>
                 <p><span className="text-gray-500">Email:</span> {owner?.email || 'Carregando...'}</p>
               </div>
             </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Fechar</button>
        </div>
      </div>
    </div>
  );
};

// --- Payment Modal Component ---
const AsaasPaymentModal = ({ isOpen, onClose, amount, pixCode, encodedImage, onConfirm }: any) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-brand-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard size={20}/> Pagamento via PIX</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Valor a pagar:</p>
            <p className="text-4xl font-extrabold text-brand-600">R$ {amount.toFixed(2).replace('.', ',')}</p>
          </div>
          
          <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-2">Código PIX Copia e Cola:</p>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <input 
                type="text" 
                readOnly 
                value={pixCode} 
                className="flex-1 p-3 text-sm font-mono bg-transparent focus:outline-none"
              />
              <button 
                onClick={handleCopy} 
                className={`p-3 text-sm font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
              >
                {copied ? <Check size={20}/> : <Copy size={20}/>}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">Ou escaneie o QR Code:</p>
            <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-inner">
              <img src={`data:image/png;base64,${encodedImage}`} alt="QR Code PIX" className="w-48 h-48" />
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center">Aguardando a confirmação do pagamento. Não feche esta janela.</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button onClick={onConfirm} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"><CheckCircle size={20}/> Já Paguei</button>
        </div>
      </div>
    </div>
  );
};

// --- Alert Component ---
const Alert: React.FC<{ type: 'success' | 'error' | 'info', message: string }> = ({ type, message }) => {
  const baseClasses = "p-4 rounded-lg flex items-center gap-3 shadow-md";
  let classes = "";
  let Icon = AlertCircle;

  switch (type) {
    case 'success':
      classes = "bg-green-100 text-green-800 border border-green-200";
      Icon = CheckCircle;
      break;
    case 'error':
      classes = "bg-red-100 text-red-800 border border-red-200";
      Icon = XCircle;
      break;
    case 'info':
      classes = "bg-blue-100 text-blue-800 border border-blue-200";
      Icon = AlertCircle;
      break;
  }

  return (
    <div className={`${baseClasses} ${classes}`} role="alert">
      <Icon size={20} className="flex-shrink-0"/>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

// --- Pages ---

const Home = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedState, setSelectedState] = useState('Todos');
  const [categories, setCategories] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const allStores = await api.getStores();
        const approvedStores = allStores.filter(s => s.status === 'APPROVED');
        setStores(approvedStores);
        
        const uniqueCategories = Array.from(new Set(allStores.map(s => s.category))).sort();
        setCategories(['Todas', ...uniqueCategories]);

        const uniqueStates = Array.from(new Set(allStores.map(s => s.state))).sort();
        setStates(['Todos', ...uniqueStates]);

      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || store.category === selectedCategory;
    const matchesState = selectedState === 'Todos' || store.state === selectedState;
    return matchesSearch && matchesCategory && matchesState;
  });

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32}/></div>;
  if (error) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message={error} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Presenteie com Liberdade</h1>
        <p className="text-xl text-gray-600">Compre vouchers de presente das suas lojas favoritas de forma rápida e segura.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-10 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
            <input
              type="text"
              placeholder="Buscar lojas por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-brand-500 focus:border-brand-500 transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-brand-500 focus:border-brand-500 transition-all"
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <StoreIcon size={48} className="mx-auto text-gray-400 mb-4"/>
          <h2 className="text-2xl font-semibold text-gray-700">Nenhuma loja encontrada</h2>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros de busca ou categoria.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredStores.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
};

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [voucherId, setVoucherId] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        if (id) {
          const fetchedStore = await api.getStoreById(id);
          setStore(fetchedStore);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  const handleGenerateMessage = async () => {
    if (!store) return;
    setIsGeneratingMessage(true);
    try {
      const prompt = `Crie uma mensagem de presente curta e carinhosa para um vale-presente de R$${amount} da loja ${store.name}. O presente é de ${senderName} para ${recipientName}.`;
      const message = await generateGiftMessage(prompt);
      setGiftMessage(message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleBuyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setIsBuying(true);
    setError('');
    setPurchaseSuccess(false);

    try {
      const voucherData = {
        storeId: store.id,
        amount,
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        giftMessage,
      };

      const payment = await api.createVoucher(voucherData);
      setPaymentDetails(payment);
      setPaymentModalOpen(true);
      setVoucherId(payment.voucherId);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBuying(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!voucherId) return;
    try {
      const voucher = await api.getVoucherById(voucherId);
      if (voucher.status === 'PAID') {
        setPaymentModalOpen(false);
        setPurchaseSuccess(true);
      } else {
        setError('O pagamento ainda não foi confirmado. Tente novamente em alguns instantes.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32}/></div>;
  if (error && !paymentModalOpen) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message={error} /></div>;
  if (!store) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message="Loja não encontrada." /></div>;

  if (purchaseSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6"/>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Compra Realizada com Sucesso!</h1>
        <p className="text-lg text-gray-600 mb-8">O voucher de presente foi enviado para o e-mail de {recipientName} ({recipientEmail}).</p>
        <Link to="/" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors">Voltar para Lojas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 p-8">
            <div className="flex items-center gap-4 mb-6">
              {store.images && store.images.length > 0 ? (
                <img src={store.images[0]} alt={store.name} className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="text-gray-400"/></div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin size={16}/> {store.city}, {store.state}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-8">{store.description}</p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Comprar Vale-Presente</h2>
            
            {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleBuyVoucher} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Valor do Vale (R$)</label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="10"
                    step="10"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 pt-4 border-t">Para Quem Você Está Presenteando?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Destinatário</label>
                  <input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">E-mail do Destinatário</label>
                  <input
                    type="email"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 pt-4 border-t">Seus Dados (Comprador)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label>
                  <input
                    type="email"
                    id="senderEmail"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 pt-4 border-t">Mensagem de Presente (Opcional)</h3>
              <div className="space-y-3">
                <textarea
                  id="giftMessage"
                  rows={4}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Escreva uma mensagem especial para o presenteado..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateMessage}
                  disabled={isGeneratingMessage || !recipientName || !senderName}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingMessage ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
                  {isGeneratingMessage ? 'Gerando...' : 'Gerar Mensagem com IA'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isBuying}
                className="w-full bg-brand-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuying ? <Loader2 size={20} className="animate-spin"/> : <CreditCard size={20}/>}
                {isBuying ? 'Processando Pagamento...' : `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`}
              </button>
            </form>
          </div>
          <div className="bg-gray-50 p-8 border-l border-gray-100 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Loja</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <p className="flex items-center gap-2"><StoreIcon size={18}/> Categoria: <span className="font-medium text-gray-800">{store.category}</span></p>
              <p className="flex items-center gap-2"><MapPin size={18}/> Localização: <span className="font-medium text-gray-800">{store.city}, {store.state}</span></p>
              <p className="flex items-center gap-2"><ExternalLink size={18}/> Site: <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 truncate">{store.website}</a></p>
            </div>
          </div>
        </div>
      </div>
      <AsaasPaymentModal 
        isOpen={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        amount={amount} 
        pixCode={paymentDetails?.pixCode || ''} 
        encodedImage={paymentDetails?.encodedImage || ''}
        onConfirm={handlePaymentConfirmation}
      />
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou <Link to="/register-store" className="font-medium text-brand-600 hover:text-brand-500">registre sua loja</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} />}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin"/> : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StoreRegister = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: User Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Store Info
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!storeName || !description || !website || !category || !city || !state) {
      setError('Preencha todos os campos da loja.');
      setLoading(false);
      return;
    }

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await api.uploadImage(imageFile);
      }

      const user = await api.registerStore({
        name,
        email,
        password,
        storeName,
        description,
        website,
        category,
        city,
        state,
        imageUrl,
      });

      setSuccess('Cadastro realizado com sucesso! Sua loja será revisada em breve.');
      setTimeout(() => {
        onLogin(user);
      }, 2000);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">1. Seus Dados de Acesso</h3>
            <div>
              <label htmlFor="name" className="sr-only">Nome Completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Próximo Passo <ChevronRight size={20}/>
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">2. Dados da Sua Loja</h3>
            <div>
              <label htmlFor="storeName" className="sr-only">Nome da Loja</label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Nome da Loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="description" className="sr-only">Descrição Curta</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Descrição Curta da Loja"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="website" className="sr-only">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Website (Ex: https://minhaloja.com.br)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="sr-only">Categoria</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="Categoria (Ex: Moda, Alimentação)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="city" className="sr-only">Cidade</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="state" className="sr-only">Estado (UF)</label>
              <select
                id="state"
                name="state"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="" disabled>Selecione o Estado (UF)</option>
                {DEFAULT_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Logo/Imagem da Loja (Opcional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500"
                    >
                      <span>{imageFile ? imageFile.name : 'Carregar um arquivo'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <ChevronRight size={20} className="rotate-180"/> Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin"/> : 'Finalizar Cadastro'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastre sua Loja
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Já tem conta? <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">Faça login</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}
          {renderStep()}
        </form>
      </div>
    </div>
  );
};

const DashboardBuyer = ({ user }: { user: User }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const fetchedVouchers = await api.getVouchersByRecipientEmail(user.email);
        setVouchers(fetchedVouchers);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, [user.email]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'USED': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32}/></div>;
  if (error) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message={error} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Vouchers de Presente</h1>
      
      {vouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Gift size={48} className="mx-auto text-gray-400 mb-4"/>
          <h2 className="text-2xl font-semibold text-gray-700">Você não possui vouchers</h2>
          <p className="text-gray-500 mt-2">Explore nossas lojas e compre um vale-presente!</p>
          <Link to="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700">
            <ShoppingBag size={20} className="mr-2"/> Ver Lojas
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {vouchers.map(voucher => (
            <div key={voucher.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Vale-Presente de R$ {voucher.amount.toFixed(2).replace('.', ',')}</h2>
                <p className="text-gray-600 mb-2">Para: <span className="font-medium">{voucher.recipientName}</span> | De: <span className="font-medium">{voucher.senderName}</span></p>
                <p className="text-sm text-gray-500">Loja: {voucher.storeName}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(voucher.status)}`}>
                  {voucher.status}
                </span>
                <Link to={`/voucher/${voucher.id}`} className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  Ver Detalhes <Eye size={16}/>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardStore = ({ user }: { user: User }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [validationResult, setValidationResult] = useState<Voucher | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isUsingVoucher, setIsUsingVoucher] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedStore = await api.getStoreByOwnerId(user.id);
        setStore(fetchedStore);
        const fetchedVouchers = await api.getVouchersByStoreId(fetchedStore.id);
        setVouchers(fetchedVouchers);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const handleValidateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationResult(null);
    setValidationError('');
    if (!voucherCode) {
      setValidationError('Insira o código do voucher.');
      return;
    }
    try {
      const result = await api.validateVoucher(voucherCode, store!.id);
      setValidationResult(result);
    } catch (err) {
      setValidationError(getErrorMessage(err));
    }
  };

  const handleUseVoucher = async () => {
    if (!validationResult) return;
    setIsUsingVoucher(true);
    setValidationError('');
    try {
      await api.useVoucher(validationResult.id);
      setValidationResult({ ...validationResult, status: 'USED' });
      // Refresh voucher list
      const fetchedVouchers = await api.getVouchersByStoreId(store!.id);
      setVouchers(fetchedVouchers);
    } catch (err) {
      setValidationError(getErrorMessage(err));
    } finally {
      setIsUsingVoucher(false);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'USED': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32}/></div>;
  if (error) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message={error} /></div>;
  if (!store) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="info" message="Sua loja está em processo de aprovação ou não foi encontrada." /></div>;

  const totalVouchers = vouchers.length;
  const totalAmount = vouchers.reduce((acc, v) => acc + v.amount, 0);
  const usedVouchers = vouchers.filter(v => v.status === 'USED').length;
  const usedAmount = vouchers.filter(v => v.status === 'USED').reduce((acc, v) => acc + v.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><StoreIcon size={28}/> Painel da Loja: {store.name}</h1>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${store.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {store.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Vouchers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalVouchers}</p>
          </div>
          <Gift size={32} className="text-brand-600"/>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor Total (R$)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
          </div>
          <DollarSign size={32} className="text-green-600"/>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Vouchers Utilizados</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{usedVouchers}</p>
          </div>
          <CheckCircle size={32} className="text-blue-600"/>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor Utilizado (R$)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">R$ {usedAmount.toFixed(2).replace('.', ',')}</p>
          </div>
          <BarChart3 size={32} className="text-red-600"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Validar Voucher</h2>
          <form onSubmit={handleValidateVoucher} className="space-y-4">
            <input
              type="text"
              placeholder="Código do Voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500"
            />
            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors"
            >
              Validar
            </button>
          </form>

          {validationError && <div className="mt-4"><Alert type="error" message={validationError} /></div>}

          {validationResult && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Resultado da Validação</h3>
              <p className="text-sm text-gray-700">Valor: <span className="font-semibold">R$ {validationResult.amount.toFixed(2).replace('.', ',')}</span></p>
              <p className="text-sm text-gray-700">Para: <span className="font-semibold">{validationResult.recipientName}</span></p>
              <p className="text-sm text-gray-700">Status: <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusClasses(validationResult.status)}`}>{validationResult.status}</span></p>
              
              {validationResult.status === 'PAID' && (
                <button
                  onClick={handleUseVoucher}
                  disabled={isUsingVoucher}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUsingVoucher ? <Loader2 size={20} className="animate-spin"/> : <Check size={20}/>}
                  {isUsingVoucher ? 'Utilizando...' : 'Utilizar Voucher'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Vouchers Vendidos</h2>
          {vouchers.length === 0 ? (
            <p className="text-gray-500">Nenhum voucher vendido ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ {voucher.amount.toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{voucher.recipientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{voucher.senderName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(voucher.status)}`}>
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(voucher.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardAdmin = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newState, setNewState] = useState('');
  const [states, setStates] = useState<string[]>(DEFAULT_STATES);
  const [newCategory, setNewCategory] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalVouchers, setTotalVouchers] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedStores = await api.getStores();
        setStores(fetchedStores);

        const allVouchers = await api.getAllVouchers();
        setChartData(prepareChartData(allVouchers));
        setTotalVouchers(allVouchers.length);
        setTotalAmount(allVouchers.reduce((acc, v) => acc + Number(v.amount), 0));

        const uniqueCategories = Array.from(new Set(fetchedStores.map(s => s.category))).sort();
        setCategories(uniqueCategories);

      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStoreStatus = async (storeId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.updateStoreStatus(storeId, status);
      setStores(stores.map(s => s.id === storeId ? { ...s, status } : s));
      setSelectedStore(selectedStore && selectedStore.id === storeId ? { ...selectedStore, status } : null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory].sort());
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleAddState = () => {
    const upperState = newState.toUpperCase();
    if (upperState.length === 2 && !states.includes(upperState)) {
      setStates([...states, upperState].sort());
      setNewState('');
    }
  };

  const handleDeleteState = (state: string) => {
    setStates(states.filter(s => s !== state));
  };

  if (loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32}/></div>;
  if (error) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Alert type="error" message={error} /></div>;

  const pendingStores = stores.filter(s => s.status === 'PENDING');
  const approvedStores = stores.filter(s => s.status === 'APPROVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2"><LayoutDashboard size={28}/> Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Lojas Aprovadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{approvedStores.length}</p>
          </div>
          <StoreIcon size={32} className="text-brand-600"/>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Vouchers Totais</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalVouchers}</p>
          </div>
          <Gift size={32} className="text-green-600"/>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor Total (R$)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
          </div>
          <DollarSign size={32} className="text-blue-600"/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Stores */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><AlertCircle size={20} className="text-yellow-600"/> Lojas Pendentes ({pendingStores.length})</h2>
            {pendingStores.length === 0 ? (
              <p className="text-gray-500">Nenhuma loja pendente de aprovação.</p>
            ) : (
              <div className="space-y-4">
                {pendingStores.map(store => (
                  <div key={store.id} className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{store.name}</p>
                      <p className="text-sm text-gray-600">{store.city}, {store.state}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedStore(store)} className="text-brand-600 hover:text-brand-700 font-medium text-sm">Ver Detalhes</button>
                      <button onClick={() => handleUpdateStoreStatus(store.id, 'APPROVED')} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Aprovar</button>
                      <button onClick={() => handleUpdateStoreStatus(store.id, 'REJECTED')} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Rejeitar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Stores */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-600"/> Lojas Aprovadas ({approvedStores.length})</h2>
            {approvedStores.length === 0 ? (
              <p className="text-gray-500">Nenhuma loja aprovada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedStores.map((store) => (
                      <tr key={store.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.city}, {store.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setSelectedStore(store)} className="text-brand-600 hover:text-brand-700">Detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Gerenciar Categorias</h3>
               <div className="flex gap-2 mb-4">
                 <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Nova Categoria" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                 <button onClick={handleAddCategory} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"><Plus size={20}/></button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <span key={c} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 group">
                      {c}
                      <button onClick={() => handleDeleteCategory(c)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
               </div>
            </div>

             {/* States */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Gerenciar Estados (UF)</h3>
               <div className="flex gap-2 mb-4">
                 <input maxLength={2} className="flex-1 border rounded-lg px-3 py-2 uppercase" placeholder="UF (Ex: SP)" value={newState} onChange={e => setNewState(e.target.value)} />
                 <button onClick={handleAddState} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"><Plus size={20}/></button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {states.map(s => (
                    <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 group">
                      {s}
                      <button onClick={() => handleDeleteState(s)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
               </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
             <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <BarChart3 className="text-brand-600"/> Relatórios Gerais
             </h2>
             <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Vendas Totais da Plataforma (Últimos 7 Dias)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                    />
                    <Bar dataKey="vendas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      <StoreDetailsModal store={selectedStore} isOpen={!!selectedStore} onClose={() => setSelectedStore(null)} />
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vp_user_session');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('vp_user_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vp_user_session');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register-store" element={!user ? <StoreRegister onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard/admin" element={user && user.role === UserRole.ADMIN ? <DashboardAdmin /> : <Navigate to="/login" />} />
          <Route path="/dashboard/store" element={user && user.role === UserRole.STORE ? <DashboardStore user={user} /> : <Navigate to="/login" />} />
          <Route path="/dashboard/buyer" element={user && user.role === UserRole.BUYER ? <DashboardBuyer user={user} /> : <Navigate to="/login" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
