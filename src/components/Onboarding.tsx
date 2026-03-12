import { useState, useEffect } from 'react';
import { Building2, Plus, ExternalLink, FileText, ShieldCheck, Calendar, AlertCircle, LogOut, Book } from 'lucide-react';
import { Company, ChartOfAccounts } from '../types';
import { createCompany, updateSelectedCompany, seedUserChartsOfAccounts } from '../services/financeService';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OnboardingProps {
  userId: string;
  companies: Company[];
  onSelectCompany: (id: string) => void;
}

export function Onboarding({ userId, companies, onSelectCompany }: OnboardingProps) {
  const [isCreating, setIsCreating] = useState(companies.length === 0);
  const [loading, setLoading] = useState(false);
  const [accountPlans, setAccountPlans] = useState<ChartOfAccounts[]>([]);

  // Form state
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [regimeTributario, setRegimeTributario] = useState<Company['regimeTributario']>('Simples Nacional');
  const [dataAbertura, setDataAbertura] = useState('');
  const [accountPlanId, setAccountPlanId] = useState<string>('');

  useEffect(() => {
    const fetchAccountPlans = async () => {
      try {
        const plansRef = collection(db, 'planos_contas');
        const q = query(plansRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChartOfAccounts[];
        setAccountPlans(plans);
        
        const defaultPlan = plans.find(p => p.padrao);
        if (defaultPlan && !accountPlanId) {
          setAccountPlanId(defaultPlan.id);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'planos_contas');
      }
    };

    if (isCreating) {
      fetchAccountPlans();
    }
  }, [userId, isCreating]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        ativa: true,
        proprietarioId: userId,
        accountPlanId: finalAccountPlanId
      };
      const newCompanyRef = await createCompany(companyData);
      await updateSelectedCompany(userId, newCompanyRef.id);
      onSelectCompany(newCompanyRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id: string) => {
    setLoading(true);
    try {
      await updateSelectedCompany(userId, id);
      onSelectCompany(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            {isCreating ? 'Bem-vindo ao Sann Contábil' : 'Selecione uma Empresa'}
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto">
            {isCreating 
              ? 'Para começar, precisamos cadastrar sua primeira empresa.' 
              : 'Escolha qual empresa você deseja gerenciar agora.'}
          </p>
        </div>

        {isCreating ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="p-8 md:p-12">
              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" /> Nome Fantasia
                    </label>
                    <input 
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
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
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
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
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
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
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" /> Regime Tributário
                    </label>
                    <select 
                      value={regimeTributario}
                      onChange={(e) => setRegimeTributario(e.target.value as Company['regimeTributario'])}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
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
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
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
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  {companies.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 px-8 py-5 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Voltar para Seleção
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] px-8 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Criar Empresa e Continuar <Plus className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {companies.map((company) => (
              <button 
                key={company.id}
                onClick={() => handleSelect(company.id)}
                disabled={loading}
                className="bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group text-left relative overflow-hidden"
              >
                <div className="bg-gray-50 group-hover:bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <Building2 className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{company.nome}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 truncate">{company.cnpj}</p>
                
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  Abrir Empresa <ExternalLink className="w-4 h-4" />
                </div>
              </button>
            ))}
            
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gray-50 rounded-[2rem] p-8 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Nova Empresa</h3>
                <p className="text-sm text-gray-500">Cadastrar outro CNPJ</p>
              </div>
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
