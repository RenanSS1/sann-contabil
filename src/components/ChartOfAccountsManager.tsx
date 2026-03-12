import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ChartOfAccounts, Account } from '../types';
import { Book, Plus, Trash2, ChevronRight, CheckCircle2, Edit2, Eye, Star, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { AccountsTreeEditor } from './AccountsTreeEditor';
import { SidebarAd } from './ads/SidebarAd';
import { 
  seedUserChartsOfAccounts, 
  createChartOfAccounts, 
  createChartFromDefault,
  updateChartOfAccounts, 
  deleteChartOfAccounts, 
  setDefaultChartOfAccounts
} from '../services/financeService';

export function ChartOfAccountsManager({ userId }: { userId: string }) {
  const [charts, setCharts] = useState<ChartOfAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'accounts'>('list');
  
  // Chart Modal state
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isCreationTypeModalOpen, setIsCreationTypeModalOpen] = useState(false);
  const [creationType, setCreationType] = useState<'default' | 'empty'>('default');
  const [editingChart, setEditingChart] = useState<Partial<ChartOfAccounts> | null>(null);
  const [chartFormNome, setChartFormNome] = useState('');
  const [chartFormDescricao, setChartFormDescricao] = useState('');

  useEffect(() => {
    if (!userId) return;

    const chartsRef = collection(db, 'planos_contas');
    const q = query(chartsRef, where('userId', '==', userId), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chartsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChartOfAccounts[];
      
      setCharts(chartsData);
      setLoading(false);
      
      if (snapshot.empty) {
        seedUserChartsOfAccounts(userId);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'planos_contas');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Chart Handlers
  const handleOpenChartModal = (chart?: ChartOfAccounts) => {
    if (chart) {
      setEditingChart(chart);
      setChartFormNome(chart.nome);
      setChartFormDescricao(chart.descricao);
      setIsChartModalOpen(true);
    } else {
      setEditingChart(null);
      setChartFormNome('');
      setChartFormDescricao('');
      setIsCreationTypeModalOpen(true);
    }
  };

  const handleContinueCreation = () => {
    setIsCreationTypeModalOpen(false);
    setIsChartModalOpen(true);
  };

  const handleSaveChart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChart?.id) {
        await updateChartOfAccounts(editingChart.id, { nome: chartFormNome, descricao: chartFormDescricao });
      } else {
        if (creationType === 'default') {
          await createChartFromDefault(chartFormNome, chartFormDescricao, userId);
        } else {
          await createChartOfAccounts(chartFormNome, chartFormDescricao, userId);
        }
      }
      setIsChartModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'planos_contas');
    }
  };

  const handleDeleteChart = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano de contas?')) {
      try {
        await deleteChartOfAccounts(id);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'planos_contas');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultChartOfAccounts(id, userId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'planos_contas');
    }
  };

  const handleViewAccounts = (id: string) => {
    setSelectedChartId(id);
    setViewMode('accounts');
  };

  if (viewMode === 'accounts') {
    const selectedChart = charts.find(c => c.id === selectedChartId);
    if (!selectedChart) {
      setViewMode('list');
      return null;
    }

    return (
      <AccountsTreeEditor 
        plano={selectedChart} 
        onBack={() => setViewMode('list')} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Planos de Contas</h1>
          <p className="text-gray-500 mt-1">Gerencie os modelos globais de planos de contas do sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenChartModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Plano de Contas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome do Plano</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total de Contas</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Plano Padrão</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : charts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 italic">
                    Nenhum plano de contas cadastrado.
                  </td>
                </tr>
              ) : (
                charts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{chart.nome}</span>
                        {chart.padrao && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate">
                      {chart.descricao}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center font-medium">
                      {chart.totalContas || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleSetDefault(chart.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          chart.padrao 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : 'text-gray-300 hover:text-gray-400 hover:bg-gray-100'
                        }`}
                        title={chart.padrao ? 'Plano Padrão' : 'Marcar como Padrão'}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewAccounts(chart.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar Contas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenChartModal(chart)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <SidebarAd />
      </div>

      {/* Chart Modal */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingChart ? 'Editar Plano de Contas' : 'Novo Plano de Contas'}
              </h3>
              <button onClick={() => setIsChartModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveChart} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  required
                  value={chartFormNome}
                  onChange={(e) => setChartFormNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ex: Plano de Contas Comercial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={chartFormDescricao}
                  onChange={(e) => setChartFormDescricao(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                  placeholder="Descreva o propósito deste plano..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChartModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creation Type Modal */}
      {isCreationTypeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Criar Plano de Contas</h3>
              <button onClick={() => setIsCreationTypeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-500">Escolha como deseja iniciar o novo plano de contas.</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCreationType('default')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    creationType === 'default' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      creationType === 'default' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {creationType === 'default' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Criar plano com padrão do sistema</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Importa automaticamente o plano de contas padrão do sistema com todas as contas contábeis.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCreationType('empty')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    creationType === 'empty' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      creationType === 'empty' ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {creationType === 'empty' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Novo plano sem registros</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cria um plano vazio para cadastrar contas manualmente.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreationTypeModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleContinueCreation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
