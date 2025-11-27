import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
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

// Componente auxiliar para rolar para o topo na mudança de rota
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

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

// --- Footer Component ---
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} ValePresente.Shop. Todos os direitos reservados.
        </div>
        <a 
          href="https://wa.me/5511999190904" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
          (11) 9 9919-0904
        </a>
      </div>
    </footer>
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
      api.getUserById(store.ownerId).then(v => setOwner(v || undefined));
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
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
         <div className="bg-[#0030b9] px-6 py-4 flex justify-between items-center">
            <span className="text-white font-bold text-xl italic tracking-wider">asaas</span>
            <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24}/></button>
         </div>
         <div className="p-6 text-center">
            <div className="mb-4">
               <h3 className="text-lg font-semibold text-gray-800">Pagamento via PIX</h3>
               <p className="text-gray-500 text-sm">Escaneie o QR Code REAL abaixo para pagar</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-[#0030b9] inline-block mb-4 shadow-sm">
               {encodedImage ? (
                   <img src={`data:image/png;base64,${encodedImage}`} className="w-[180px] h-[180px]" alt="Pix QR Code" />
               ) : (
                   <QRCode value={pixCode} size={180} />
               )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-6">R$ {amount.toFixed(2)}</div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 text-left">
              <label className="text-xs text-gray-500 font-bold mb-1 block uppercase">Código Pix Copia e Cola</label>
              <div className="flex gap-2">
                <input readOnly value={pixCode} className="flex-1 text-xs text-gray-600 bg-transparent outline-none truncate font-mono"/>
                <button onClick={handleCopy} className="text-[#0030b9] hover:text-[#002080] font-medium text-xs flex items-center gap-1">
                   {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <button 
               onClick={onConfirm}
               className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg"
            >
               Já realizei o pagamento
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Pages ---

const StorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  const [amount, setAmount] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [message, setMessage] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guestData, setGuestData] = useState({ name: '', email: '', cpf: '' });
  const [loadingPay, setLoadingPay] = useState(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const SUGGESTED_AMOUNTS = [50, 100, 200];
  const MIN_AMOUNT = 50;

  useEffect(() => {
    const session = localStorage.getItem('vp_user_session');
    if (session) setCurrentUser(JSON.parse(session));
    if (id) api.getStoreById(id).then(setStore);
  }, [id]);

  const handleAiGenerate = async () => {
    setLoadingAi(true);
    const msg = await generateGiftMessage('Presente Geral', 'Amigo/Familiar', receiverName || 'Pessoa Querida', 'Carinhoso');
    setMessage(msg);
    setLoadingAi(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setLoadingPay(true);
    try {
      let buyerId = currentUser?.id;
      if (!buyerId) {
        const user = await api.registerBuyer(guestData.name, guestData.email);
        buyerId = user.id;
        localStorage.setItem('vp_user_session', JSON.stringify(user));
        setCurrentUser(user);
      }

      if (store.paymentConfig?.apiKey) {
         const charge = await api.createRealAsaasCharge(
           store.paymentConfig.apiKey, 
           parseFloat(amount), 
           `Voucher: ${store.name}`, 
           { 
             name: guestData.name || currentUser?.name || 'Cliente', 
             email: guestData.email || currentUser?.email || 'cliente@email.com',
             cpf: guestData.cpf || '00000000000'
           }
         );

         if (charge.success && charge.isSimulation) {
             setPaymentData({ 
                 pixCode: charge.pixCode, 
                 encodedImage: charge.encodedImage,
                 amount: parseFloat(amount) 
             });
             setShowPaymentModal(true);
             setLoadingPay(false);
             return;
         }
      }

      await confirmVoucherCreation(buyerId);
      
    } catch (error) {
      alert(`Erro no pagamento: ${getErrorMessage(error)}`);
      setLoadingPay(false);
    } 
  };

  const confirmVoucherCreation = async (buyerId?: string) => {
      const finalBuyerId = buyerId || currentUser?.id;
      if (!store || !finalBuyerId) return;

      setShowPaymentModal(false);
      setLoadingPay(true);
      
      const createdVoucher = await api.createVoucher({
        storeId: store.id,
        buyerId: finalBuyerId,
        receiverName,
        amount: parseFloat(amount),
        message,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
      setVoucher(createdVoucher as Voucher);
      setStep(3);
      setLoadingPay(false);
  };

  const isAmountValid = amount && parseFloat(amount) >= MIN_AMOUNT;

  if (!store) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <AsaasPaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentData?.amount || 0}
        pixCode={paymentData?.pixCode || ''}
        encodedImage={paymentData?.encodedImage}
        onConfirm={() => confirmVoucherCreation()}
      />

      <div className="h-64 md:h-80 bg-gray-900 relative">
         {store.images[0] && <img src={store.images[0]} className="w-full h-full object-cover opacity-60" />}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent flex items-end">
            <div className="max-w-4xl mx-auto w-full px-6 py-8 text-white">
               <div className="inline-block bg-brand-600 px-2 py-1 rounded text-xs font-bold mb-2">{store.category}</div>
               <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
               <div className="flex items-center opacity-90"><MapPin size={16} className="mr-1"/> {store.city}, {store.state}</div>
            </div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Configure seu Presente</h2>
              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Valores Sugeridos do Presente (R$)</label>
                   <div className="flex gap-3 mb-3">
                     {SUGGESTED_AMOUNTS.map(val => (
                       <button 
                         key={val}
                         onClick={() => setAmount(val.toString())}
                         className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${amount === val.toString() ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'}`}
                       >
                         R$ {val},00
                       </button>
                     ))}
                   </div>
                   <p className="text-sm text-gray-600 mb-2 mt-4 font-medium">Ou digite o valor que deseja presentear na loja:</p>
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                     <input 
                        type="number" 
                        min={MIN_AMOUNT}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg text-lg font-bold focus:ring-2 outline-none ${amount && parseFloat(amount) < MIN_AMOUNT ? 'border-red-300 focus:ring-red-200 text-red-600' : 'border-gray-300 focus:ring-brand-500 text-brand-600'}`}
                        placeholder="0,00" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                      />
                   </div>
                   {amount && parseFloat(amount) < MIN_AMOUNT && (
                     <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                       <AlertCircle size={12}/> O valor mínimo é R$ {MIN_AMOUNT},00
                     </p>
                   )}
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Presenteado</label>
                   <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Maria Silva" value={receiverName} onChange={e => setReceiverName(e.target.value)} />
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Mensagem Especial</label>
                      <button onClick={handleAiGenerate} disabled={loadingAi || !receiverName} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors disabled:opacity-50">
                        <Sparkles size={12}/> {loadingAi ? 'Escrevendo...' : 'Gerar com IA'}
                      </button>
                   </div>
                   <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Escreva algo carinhoso..." value={message} onChange={e => setMessage(e.target.value)} />
                </div>
                <button 
                  disabled={!isAmountValid || !receiverName}
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continuar para Pagamento
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
               <div className="flex items-center gap-2 mb-6">
                 <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-sm">Voltar</button>
                 <h2 className="text-2xl font-bold text-gray-800">Pagamento</h2>
               </div>
               <form onSubmit={handlePayment} className="space-y-6">
                 {!currentUser && (
                   <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100">
                      <h3 className="font-semibold text-blue-800">Seus Dados</h3>
                      <input required type="text" placeholder="Seu Nome" className="w-full px-3 py-2 border rounded-md" value={guestData.name} onChange={e => setGuestData({...guestData, name: e.target.value})} />
                      <input required type="email" placeholder="Seu Email" className="w-full px-3 py-2 border rounded-md" value={guestData.email} onChange={e => setGuestData({...guestData, email: e.target.value})} />
                      <input required type="text" placeholder="Seu CPF (Apenas números)" className="w-full px-3 py-2 border rounded-md" value={guestData.cpf} onChange={e => setGuestData({...guestData, cpf: e.target.value.replace(/\D/g, '')})} maxLength={11} />
                   </div>
                 )}
                 {currentUser && (
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Obrigatório para Pix)</label>
                      <input required type="text" placeholder="000.000.000-00" className="w-full px-3 py-2 border rounded-md" value={guestData.cpf} onChange={e => setGuestData({...guestData, cpf: e.target.value.replace(/\D/g, '')})} maxLength={11} />
                   </div>
                 )}

                 <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-gray-600">Total a pagar</span>
                       <span className="text-xl font-bold text-gray-900">R$ {parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="space-y-2">
                       <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="payment" defaultChecked className="text-brand-600" />
                          <div className="flex items-center gap-2 text-gray-700 font-medium"><div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-xs text-white font-serif">P</div> PIX (Asaas)</div>
                       </label>
                    </div>
                 </div>
                 <button type="submit" disabled={loadingPay} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2">
                    {loadingPay ? <Loader2 className="animate-spin"/> : <>Pagar R$ {parseFloat(amount).toFixed(2)}</>}
                 </button>
               </form>
            </div>
          )}

          {step === 3 && voucher && (
             <div className="p-8 text-center bg-white">
               <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <Check size={32} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h2>
               <p className="text-gray-500 mb-8">Seu voucher foi gerado com sucesso.</p>
               <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 max-w-sm mx-auto mb-8 relative">
                  <div className="text-sm text-gray-400 font-mono mb-4">CÓDIGO: {voucher.code}</div>
                  <div className="bg-white p-3 inline-block rounded-lg shadow-sm mb-4">
                     <QRCode value={voucher.qrData} size={150} />
                  </div>
                  <div className="font-bold text-2xl text-gray-900 mb-1">R$ {Number(voucher.amount).toFixed(2)}</div>
                  <div className="text-gray-600 text-sm">Loja: {store.name}</div>
                  {voucher.message && <div className="mt-4 pt-4 border-t text-sm italic text-gray-500">"{voucher.message}"</div>}
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      let text = `Olá ${receiverName}! Te enviei um presente de R$ ${amount} na loja ${store.name}.`;
                      if (voucher.message) {
                          text += `\n\n💌 Mensagem: "${voucher.message}"`;
                      }
                      text += `\n\n🎁 Acesse o voucher aqui: Código ${voucher.code}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={20}/> Enviar por WhatsApp
                  </button>
                  <Link to="/" className="text-brand-600 font-medium hover:underline py-2">Voltar para Início</Link>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardStore = ({ user }: { user: User }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'HOME' | 'SETTINGS' | 'REPORTS'>('HOME');
  const [redeemCode, setRedeemCode] = useState('');
  
  const [asaasKey, setAsaasKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    if (user.storeId) {
      loadStoreData();
    }
  }, [user]);

  const loadStoreData = async () => {
    setLoading(true);
    const [s, v] = await Promise.all([
      api.getStoreById(user.storeId!),
      api.getVouchersByStore(user.storeId!)
    ]);
    setStore(s);
    if (s && s.paymentConfig) {
        setAsaasKey(s.paymentConfig.apiKey || '');
    }
    setVouchers(v);
    setLoading(false);
  };

  const handleSavePaymentConfig = async () => {
    if (!store) return;
    setSavingKey(true);
    try {
        await api.updateStorePaymentConfig(store.id, asaasKey);
        alert('Chave API do Asaas salva com sucesso!');
    } catch (e) {
        alert('Erro ao salvar chave: ' + getErrorMessage(e));
    } finally {
        setSavingKey(false);
    }
  };

  const handleRedeem = async () => {
    if (!store || !redeemCode) return;
    const res = await api.redeemVoucher(redeemCode, store.id);
    alert(res.message);
    if (res.success) {
      setRedeemCode('');
      loadStoreData(); 
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (store && e.target.files && e.target.files[0]) {
      try {
        const base64 = await resizeImage(e.target.files[0]);
        const newImages = [base64, ...store.images].slice(0, 6);
        await api.updateStoreImages(store.id, newImages);
        loadStoreData();
      } catch (e) {
        alert(`Erro ao enviar imagem: ${getErrorMessage(e)}`);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
  if (!store) return <div className="p-8 text-center">Loja não encontrada.</div>;

  if (store.status === 'PENDING') return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle size={64} className="text-yellow-600 mb-4"/>
      <h1 className="text-3xl font-bold text-yellow-800 mb-2">Aprovação Pendente</h1>
      <p className="text-yellow-700 max-w-md">Sua loja foi registrada com sucesso e está aguardando análise da nossa equipe. Você receberá um e-mail assim que for aprovada.</p>
    </div>
  );

  if (store.status === 'REJECTED') return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
      <XCircle size={64} className="text-red-600 mb-4"/>
      <h1 className="text-3xl font-bold text-red-800 mb-2">Cadastro Recusado</h1>
      <p className="text-red-700 max-w-md">Infelizmente seu cadastro não foi aprovado. Entre em contato com o suporte para mais detalhes.</p>
    </div>
  );

  const chartData = prepareChartData(vouchers);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-500">Painel do Parceiro</p>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button onClick={() => setActiveTab('HOME')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'HOME' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}>Visão Geral</button>
            <button onClick={() => setActiveTab('REPORTS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'REPORTS' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}>Relatórios</button>
            <button onClick={() => setActiveTab('SETTINGS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'SETTINGS' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}>Configurações</button>
          </div>
        </div>

        {activeTab === 'HOME' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <div className="text-sm text-gray-500">Saldo Total</div>
                     <div className="text-2xl font-bold text-green-600">R$ {vouchers.reduce((acc,v) => acc + Number(v.amount), 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <div className="text-sm text-gray-500">Vouchers Ativos</div>
                     <div className="text-2xl font-bold text-blue-600">{vouchers.filter(v => v.status === 'ACTIVE').length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                     <div className="text-sm text-gray-500">Resgatados</div>
                     <div className="text-2xl font-bold text-gray-600">{vouchers.filter(v => v.status === 'REDEEMED').length}</div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Validar Voucher</h3>
                 <div className="flex gap-4">
                   <input 
                     className="flex-1 border rounded-lg px-4 py-2 text-lg uppercase tracking-widest" 
                     placeholder="VP-XXXX-XXXX"
                     value={redeemCode}
                     onChange={e => setRedeemCode(e.target.value)}
                   />
                   <button onClick={handleRedeem} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700">
                     VALIDAR
                   </button>
                 </div>
               </div>
               
               <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                 <h3 className="px-6 py-4 font-bold text-gray-900 border-b border-gray-100">Últimos Vouchers</h3>
                 <div className="divide-y divide-gray-100">
                   {vouchers.length === 0 ? <p className="p-6 text-gray-500 text-center">Nenhum voucher ainda.</p> : vouchers.map(v => (
                     <div key={v.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-gray-900">{v.code}</div>
                          <div className="text-sm text-gray-500">De: {v.receiverName || 'Anônimo'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">R$ {Number(v.amount).toFixed(2)}</div>
                          <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block ${v.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {v.status === 'ACTIVE' ? 'ATIVO' : 'RESGATADO'}
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
            
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Preview da Loja</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                    {store.images[0] ? <img src={store.images[0]} className="w-full h-full object-cover"/> : <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"/>}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Categoria: <span className="text-gray-900">{store.category}</span></div>
                    <div className="text-sm text-gray-500">Cidade: <span className="text-gray-900">{store.city}</span></div>
                  </div>
               </div>
            </div>
          </div>
        ) : activeTab === 'REPORTS' ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
             <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <BarChart3 className="text-brand-600"/> Relatórios Financeiros
             </h2>
             <div className="h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Vendas nos Últimos 7 Dias</h3>
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
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-brand-600"/> Integração de Pagamento (Asaas)
                </h2>
                <div className="max-w-2xl">
                    <p className="text-gray-600 mb-4 text-sm">
                        Para receber pagamentos diretamente, insira sua chave de API do Asaas abaixo. 
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chave de API (Asaas)</label>
                            <input 
                                type="password" 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 font-mono text-sm" 
                                placeholder="$aact_..." 
                                value={asaasKey}
                                onChange={e => setAsaasKey(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1">Sua chave é criptografada e armazenada com segurança.</p>
                        </div>
                        <button 
                            onClick={handleSavePaymentConfig}
                            disabled={savingKey}
                            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {savingKey ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                            Salvar Configuração
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                  <ImageIcon className="text-brand-600"/> Galeria de Imagens
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {store.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm border">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={async () => {
                        try {
                           const newImgs = store.images.filter((_, i) => i !== idx);
                           await api.updateStoreImages(store.id, newImgs);
                           loadStoreData();
                        } catch (e) {
                          alert(`Erro ao apagar imagem: ${getErrorMessage(e)}`);
                        }
                      }}
                      className="absolute top-2 right-2 bg-white/90 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square cursor-pointer hover:bg-gray-50 hover:border-brand-400 transition-colors">
                  <Plus className="text-gray-400 mb-2"/>
                  <span className="text-sm text-gray-500">Adicionar Foto</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                </label>
              </div>
              <p className="text-sm text-gray-500">Máximo de 6 imagens. Formatos aceitos: JPG, PNG.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cats, sts] = await Promise.all([api.getCategories(), api.getStores('APPROVED')]);
      setCategories(cats);
      setAllStores(sts);
      setStores(sts);
      
      const uniqueStates = Array.from(new Set(sts.map(s => s.state))).sort();
      setAvailableStates(uniqueStates);
      setLoading(false);
    };
    fetchData();
    
    // AUTO-GEOLOCATION ON MOUNT
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(async (position) => {
         try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
            if (city) setSearchTerm(city);
         } catch (e) {
            console.error("Auto-geo failed silently", e);
         }
       }, (err) => console.log("Auto-geo permission denied or failed", err));
    }
  }, []);

  useEffect(() => {
    let results = allStores;
    if (selectedCategory) results = results.filter(s => s.category === selectedCategory);
    if (selectedState) results = results.filter(s => s.state === selectedState);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.city.toLowerCase().includes(lower)
      );
    }
    setStores(results);
  }, [searchTerm, selectedCategory, selectedState, allStores]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
        
        if (city) {
          setSearchTerm(city);
        } else {
          alert("Não foi possível identificar sua cidade.");
        }
      } catch (error) {
        console.error("Erro na geolocalização:", error);
        alert("Erro ao obter localização.");
      } finally {
        setGeoLoading(false);
      }
    }, (error) => {
      console.error("Erro de permissão ou GPS:", error);
      alert("Para usar este recurso, permita o acesso à localização.");
      setGeoLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-brand-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">O Presente Perfeito, Sem Erro.</h1>
          <p className="text-white text-3xl md:text-5xl font-extrabold mb-12 max-w-4xl mx-auto leading-tight drop-shadow-md">
            Escolha uma loja incrível, defina o valor e envie um voucher digital.
          </p>
          
          <div className="bg-white p-2 rounded-lg shadow-lg max-w-4xl mx-auto flex flex-col md:flex-row gap-2 items-center">
            <div className="flex-1 w-full flex items-center px-4 bg-gray-50 rounded-md border border-transparent focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Buscar loja ou cidade..." 
                className="w-full bg-transparent border-none focus:ring-0 p-3 text-gray-800 placeholder-gray-400" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={handleUseLocation} 
                title="Usar minha localização"
                className="ml-2 text-brand-600 hover:text-brand-800 p-2 hover:bg-brand-50 rounded-full transition-colors"
              >
                {geoLoading ? <Loader2 className="animate-spin" size={20}/> : <Navigation size={20} />}
              </button>
            </div>
            <select className="w-full md:w-48 bg-gray-50 rounded-md border-transparent focus:border-brand-300 focus:ring-brand-100 p-3 text-gray-700" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Todas Categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="w-full md:w-32 bg-gray-50 rounded-md border-transparent focus:border-brand-300 focus:ring-brand-100 p-3 text-gray-700" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="">Estado</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Lojas em Destaque</h2>
          <span className="text-gray-500 text-sm">{stores.length} lojas encontradas</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" size={48} /></div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma loja encontrada</h3>
            <p className="text-gray-500">Tente ajustar seus filtros ou usar a geolocalização.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ... StoreRegister, Login, DashboardBuyer remain same ...
const StoreRegister = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { 
    api.getCategories().then(setCategories);
    api.getStates().then(setStates);
  }, []);

  const [formData, setFormData] = useState({
    ownerName: '', ownerEmail: '', password: '', storeName: '', category: '', description: '', city: '', state: '', imageUrl: '',
  });

  useEffect(() => {
    if(categories.length > 0 && !formData.category) setFormData(prev => ({ ...prev, category: categories[0] }));
    if(states.length > 0 && !formData.state) setFormData(prev => ({ ...prev, state: states[0] }));
  }, [categories, states]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const resized = await resizeImage(e.target.files[0]);
      setFormData(prev => ({ ...prev, imageUrl: resized }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setLoading(true);
      try {
        const { user } = await api.registerStore({
          name: formData.storeName,
          category: formData.category || categories[0],
          description: formData.description,
          city: formData.city,
          state: formData.state || states[0],
          images: formData.imageUrl ? [formData.imageUrl] : []
        }, {
          name: formData.ownerName,
          email: formData.ownerEmail,
          password: formData.password
        });
        onLogin(user);
        alert('Cadastro realizado! Aguarde aprovação.');
        navigate('/dashboard/store');
      } catch (error: any) {
        console.error(error);
        const msg = getErrorMessage(error);
        if (msg.includes('users_email_key') || msg.includes('duplicate key')) {
             alert('Este email já está em uso. Por favor, faça login ou use outro email.');
        } else {
             alert(`Erro ao registrar: ${msg}`);
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="bg-brand-600 px-8 py-6 text-white">
           <h2 className="text-2xl font-bold">Cadastro de Parceiro</h2>
           <p className="opacity-90">Junte-se ao ValePresente.ai</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {step === 1 ? (
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-900">Dados do Responsável</h3>
               <div className="grid grid-cols-1 gap-4">
                 <input required placeholder="Nome Completo" className="w-full border rounded-lg px-3 py-2" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                 <input required type="email" placeholder="Email" className="w-full border rounded-lg px-3 py-2" value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} />
                 <input required type="password" placeholder="Crie uma Senha" className="w-full border rounded-lg px-3 py-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
               <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2">Próximo <ChevronRight size={16} /></button>
               </div>
             </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dados da Loja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nome Fantasia" className="w-full border rounded-lg px-3 py-2 md:col-span-2" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} />
                <select className="w-full border rounded-lg px-3 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="w-full border rounded-lg px-3 py-2" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Cidade" className="w-full border rounded-lg px-3 py-2 md:col-span-2" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                <textarea required placeholder="Descrição" rows={3} className="w-full border rounded-lg px-3 py-2 md:col-span-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Foto Principal</label>
                   <div className="flex items-center gap-4">
                     {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 rounded-lg object-cover border" />}
                     <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <Upload size={16} /> Carregar Foto
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                     </label>
                   </div>
                </div>
              </div>
               <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-600 font-medium hover:text-gray-900">Voltar</button>
                  <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                    {loading ? 'Registrando...' : 'Finalizar Cadastro'}
                  </button>
               </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      if (user) {
        onLogin(user);
        if(user.role === UserRole.STORE) navigate('/dashboard/store');
        else if(user.role === UserRole.BUYER) navigate('/dashboard/buyer');
        else if(user.role === UserRole.ADMIN) navigate('/dashboard/admin');
      } else {
        alert('Email ou senha inválidos.');
      }
    } catch (e: any) {
      const msg = getErrorMessage(e);
      alert(`Erro ao conectar: ${msg}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Acesse sua Conta</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
             <input type="email" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
             <input type="password" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors flex justify-center">
            {loading ? <Loader2 className="animate-spin"/> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const DashboardBuyer = ({ user }: { user: User }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await api.getVouchersByBuyer(user.id);
        setVouchers(data);
      } catch (error) {
        console.error("Error fetching vouchers", error);
      } finally {
        setLoading(false);
      }
    };
    if (user.id) fetchVouchers();
  }, [user.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Vouchers</h1>
        
        {vouchers.length === 0 ? (
           <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-gray-400"/>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Você ainda não tem vouchers</h2>
              <p className="text-gray-500 mb-6">Explore as lojas e encontre o presente ideal.</p>
              <Link to="/" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors inline-flex items-center gap-2">
                Explorar Lojas
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {vouchers.map(voucher => (
                <div key={voucher.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block mb-2">{voucher.code}</div>
                            <h3 className="text-lg font-bold text-gray-900">Para: {voucher.receiverName}</h3>
                         </div>
                         <div className="text-right">
                            <div className="text-xl font-bold text-brand-600">R$ {Number(voucher.amount).toFixed(2)}</div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${voucher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {voucher.status === 'ACTIVE' ? 'ATIVO' : 'RESGATADO'}
                            </span>
                         </div>
                      </div>
                      
                      {voucher.message && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                           <p className="text-gray-600 text-sm italic">"{voucher.message}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="text-xs text-gray-500 flex flex-col">
                             <span>Expira em:</span>
                             <span className="font-medium">{new Date(voucher.expiresAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             {voucher.status === 'ACTIVE' && (
                                <button 
                                  onClick={() => {
                                    const text = `Olá ${voucher.receiverName}! Te enviei um presente de R$ ${Number(voucher.amount).toFixed(2)}. Acesse: Código ${voucher.code}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                  title="Enviar no WhatsApp"
                                >
                                  <Share2 size={20}/>
                                </button>
                             )}
                             <div className="relative group">
                                <QrCode size={20} className="text-gray-400 cursor-help"/>
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-white shadow-xl rounded-lg hidden group-hover:block z-10 border border-gray-100">
                                   <QRCode value={voucher.qrData} size={100} />
                                </div>
                             </div>
                          </div>
                      </div>
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

// --- Dashboard: Admin ---
const DashboardAdmin = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newState, setNewState] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'REPORTS'>('HOME');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sts, vchs, cats, stsList] = await Promise.all([
        api.getStores(), 
        api.getAllVouchers(),
        api.getCategories(),
        api.getStates()
      ]);
      setStores(sts);
      setVouchers(vchs);
      setCategories(cats);
      setStates(stsList);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
      await api.updateStoreStatus(id, 'APPROVED');
      loadData();
    } catch (e) {
      setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'PENDING' } : s));
      alert(`Erro ao aprovar: ${getErrorMessage(e)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s));
      await api.updateStoreStatus(id, 'REJECTED');
      loadData();
    } catch (e) {
      setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'PENDING' } : s));
      alert(`Erro ao rejeitar: ${getErrorMessage(e)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory) {
      if (categories.some(c => c.toLowerCase() === newCategory.trim().toLowerCase())) {
        alert('Esta categoria já existe.');
        return;
      }
      try {
        await api.addCategory(newCategory.trim());
        setNewCategory('');
        alert('Categoria adicionada!');
        loadData();
      } catch (e) {
        const msg = getErrorMessage(e);
        if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
          alert('Erro: Esta categoria já existe.');
        } else {
          alert(`Erro ao adicionar categoria: ${msg}`);
        }
      }
    }
  };

  const handleAddState = async () => {
    if (newState) {
       if (states.some(s => s === newState.trim().toUpperCase())) return;
       try {
         await api.addState(newState.trim().toUpperCase());
         setNewState('');
         alert('Estado adicionado!');
         loadData();
       } catch (e) {
         alert(`Erro ao adicionar estado: ${getErrorMessage(e)}`);
       }
    }
  };

  const handleDeleteState = async (code: string) => {
    if (confirm(`Deseja remover o estado ${code}?`)) {
       try {
         await api.deleteState(code);
         loadData();
       } catch (e) {
         alert('Erro ao remover estado.');
       }
    }
  };

  const filteredStores = filter === 'ALL' ? stores : stores.filter(s => s.status === filter);

  const stats = {
    totalStores: stores.length,
    pendingStores: stores.filter(s => s.status === 'PENDING').length,
    totalVouchers: vouchers.length,
    revenue: vouchers.reduce((acc, v) => acc + Number(v.amount), 0)
  };
  
  const chartData = prepareChartData(vouchers);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('HOME')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'HOME' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}>Geral</button>
             <button onClick={() => setActiveTab('REPORTS')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'REPORTS' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600'}`}>Relatórios</button>
          </div>
        </div>

        {activeTab === 'HOME' ? (
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium">Faturamento Total</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">R$ {stats.revenue.toLocaleString()}</div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium">Lojas Cadastradas</div>
                <div className="text-3xl font-bold text-brand-600 mt-2">{stats.totalStores}</div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium">Aprovações Pendentes</div>
                <div className="text-3xl font-bold text-yellow-500 mt-2">{stats.pendingStores}</div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium">Vouchers Emitidos</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">{stats.totalVouchers}</div>
             </div>
          </div>

          {/* Store Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">Gerenciar Lojas</h2>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                 {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                   <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                     {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendentes' : f === 'APPROVED' ? 'Aprovadas' : 'Rejeitadas'} 
                     <span className="ml-2 text-xs opacity-60 bg-gray-200 px-1.5 rounded-full">
                       {f === 'ALL' ? stores.length : stores.filter(s => s.status === f).length}
                     </span>
                   </button>
                 ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-medium">Loja</th>
                    <th className="px-6 py-3 font-medium">Categoria</th>
                    <th className="px-6 py-3 font-medium">Local</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto"/></td></tr>
                  ) : filteredStores.map(store => (
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{store.name}</div>
                        <div className="text-xs text-gray-500">Cadastrada em: {new Date(store.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{store.category}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{store.city}, {store.state}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${store.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            store.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => setSelectedStore(store)} className="text-gray-400 hover:text-brand-600" title="Ver Detalhes"><Eye size={18}/></button>
                        {store.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleApprove(store.id)} 
                              disabled={processingId === store.id}
                              className="text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50"
                            >
                              {processingId === store.id ? '...' : 'Aprovar'}
                            </button>
                            <button 
                              onClick={() => handleReject(store.id)} 
                              disabled={processingId === store.id}
                              className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                            >
                              {processingId === store.id ? '...' : 'Recusar'}
                            </button>
                          </>
                        )}
                        {store.status === 'APPROVED' && (
                          <Link to={`/store/${store.id}`} className="text-brand-600 hover:text-brand-800 inline-block ml-2" title="Ver Página Pública"><ExternalLink size={18}/></Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Gerenciar Categorias</h3>
               <div className="flex gap-2 mb-4">
                 <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Nova Categoria" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                 <button onClick={handleAddCategory} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"><Plus size={20}/></button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <span key={c} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{c}</span>
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
          </>
        ) : (
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
        )}
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
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-grow">
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
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;