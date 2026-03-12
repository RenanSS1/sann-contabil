import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Company, ChartOfAccounts } from '../types';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  FileText,
  ShieldCheck,
  Book
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { createCompany, updateCompany, deleteCompany, seedUserChartsOfAccounts } from '../services/financeService';
import { SidebarAd } from './ads/SidebarAd';

interface CompaniesManagerProps {
  userId: string;
  onSelectCompany: (companyId: string) => void;
  activeCompanyId: string | null;
}

export function CompaniesManager({ userId, onSelectCompany, activeCompanyId }: CompaniesManagerProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accountPlans, setAccountPlans] = useState<ChartOfAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [regimeTributario, setRegimeTributario] = useState<Company['regimeTributario']>('Simples Nacional');
  const [dataAbertura, setDataAbertura] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [accountPlanId, setAccountPlanId] = useState<string>('');

  useEffect(() => {
    // Fetch account plans for the user
    const fetchAccountPlans = async () => {
      try {
        const plansRef = collection(db, 'planos_contas');
        const q = query(plansRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChartOfAccounts[];
        setAccountPlans(plans);
        
        // Find default plan
        const defaultPlan = plans.find(p => p.padrao);
        if (defaultPlan && !accountPlanId) {
          setAccountPlanId(defaultPlan.id);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'planos_contas');
      }
    };

    fetchAccountPlans();
  }, [userId]);

  useEffect(() => {
    const companiesRef = collection(db, 'empresas');
    const q = query(
      companiesRef, 
      where('proprietarioId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'empresas');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setNome(company.nome);
      setRazaoSocial(company.razaoSocial);
      setCnpj(company.cnpj);
      setRegimeTributario(company.regimeTributario);
      setDataAbertura(company.dataAbertura);
      setAtiva(company.ativa);
      setAccountPlanId(company.accountPlanId || '');
    } else {
      setEditingCompany(null);
      setNome('');
      setRazaoSocial('');
      setCnpj('');
      setRegimeTributario('Simples Nacional');
      setDataAbertura('');
      setAtiva(true);
      const defaultPlan = accountPlans.find(p => p.padrao);
      setAccountPlanId(defaultPlan?.id || '');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalAccountPlanId = accountPlanId;
      if (!finalAccountPlanId) {
        finalAccountPlanId = await seedUserChartsOfAccounts(userId);
      }

      const companyData = {
        nome,
        razaoSocial,
        cnpj,
        regimeTributario,
        dataAbertura,
        ativa,
        proprietarioId: userId,
        accountPlanId: finalAccountPlanId
      };

      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'empresas');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir a empresa "${name}"?`)) {
      try {
        await deleteCompany(id);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `empresas/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Minhas Empresas</h1>
          <p className="text-gray-500 font-medium">Gerencie as empresas do seu portfólio contábil.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Carregando empresas...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Comece cadastrando sua primeira empresa para gerenciar lançamentos e planos de contas.
          </p>
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            Cadastrar agora <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div 
              key={company.id}
              className={`bg-white rounded-3xl p-6 border transition-all group relative overflow-hidden ${
                activeCompanyId === company.id 
                  ? 'border-blue-500 ring-4 ring-blue-50' 
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              {activeCompanyId === company.id && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ativa
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl ${activeCompanyId === company.id ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'} transition-colors`}>
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(company)}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(company.id, company.nome)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 truncate">{company.nome}</h3>
                  <p className="text-sm text-gray-500 font-medium truncate">{company.razaoSocial}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">CNPJ</p>
                    <p className="text-sm font-mono text-gray-700">{company.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Regime</p>
                    <p className="text-sm font-bold text-gray-700">{company.regimeTributario}</p>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectCompany(company.id)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    activeCompanyId === company.id
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {activeCompanyId === company.id ? 'Empresa Aberta' : 'Abrir Empresa'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <SidebarAd />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Nome Fantasia
                  </label>
                  <input 
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Ex: Sann Labs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" /> Razão Social
                  </label>
                  <input 
                    type="text"
                    required
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    placeholder="Ex: Sann Tecnologia LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> CNPJ
                  </label>
                  <input 
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Data de Abertura
                  </label>
                  <input 
                    type="date"
                    required
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" /> Regime Tributário
                  </label>
                  <select 
                    value={regimeTributario}
                    onChange={(e) => setRegimeTributario(e.target.value as Company['regimeTributario'])}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
                  >
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Book className="w-4 h-4 text-gray-400" /> Plano de Contas
                  </label>
                  <select 
                    value={accountPlanId}
                    onChange={(e) => setAccountPlanId(e.target.value)}
                    required={accountPlans.length > 0}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
                  >
                    <option value="" disabled>
                      {accountPlans.length === 0 ? 'Será criado um plano padrão automaticamente' : 'Selecione um plano de contas'}
                    </option>
                    {accountPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.nome} {plan.padrao ? '(Padrão)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8 md:col-span-2">
                  <input 
                    type="checkbox"
                    id="ativa"
                    checked={ativa}
                    onChange={(e) => setAtiva(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativa" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Empresa Ativa
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
