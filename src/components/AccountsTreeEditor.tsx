import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Account, ChartOfAccounts } from '../types';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Maximize2, 
  Minimize2, 
  X,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Star
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { 
  createAccount, 
  updateAccount, 
  deleteAccount,
  isAccountUsedInTransactions
} from '../services/financeService';

interface AccountsTreeEditorProps {
  plano: Partial<ChartOfAccounts>;
  collectionPath?: string;
  onBack: () => void;
}

interface TreeNode extends Account {
  children: TreeNode[];
}

export function AccountsTreeEditor({ plano, collectionPath, onBack }: AccountsTreeEditorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  const effectivePath = collectionPath || `planos_contas/${plano.id}/contas`;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<Account> | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formTipo, setFormTipo] = useState<Account['tipo']>('Ativo');
  const [formNatureza, setFormNatureza] = useState<Account['natureza']>('Devedora');
  const [formAceitaLancamento, setFormAceitaLancamento] = useState(true);
  const [formAtivo, setFormAtivo] = useState(true);

  // Delete state
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const accountsRef = collection(db, effectivePath);
    const q = query(accountsRef, orderBy('codigo', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      setAccounts(accountsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, effectivePath);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [effectivePath]);

  // Build tree structure
  const treeData = useMemo(() => {
    const nodes: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    // First pass: create all nodes
    accounts.forEach(acc => {
      nodes[acc.codigo] = { ...acc, children: [] };
    });

    // Second pass: link children to parents
    accounts.forEach(acc => {
      const parts = acc.codigo.split('.');
      if (parts.length === 1) {
        roots.push(nodes[acc.codigo]);
      } else {
        const parentCodigo = parts.slice(0, -1).join('.');
        if (nodes[parentCodigo]) {
          nodes[parentCodigo].children.push(nodes[acc.codigo]);
        } else {
          // If parent not found (shouldn't happen with correct data), treat as root
          roots.push(nodes[acc.codigo]);
        }
      }
    });

    return roots;
  }, [accounts]);

  const toggleNode = (codigo: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [codigo]: !prev[codigo]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    accounts.forEach(acc => {
      if (!acc.aceitaLancamento) {
        allExpanded[acc.codigo] = true;
      }
    });
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleOpenModal = (acc?: Partial<Account>, parentCodigo?: string) => {
    if (acc && acc.id) {
      // Edit mode
      setEditingAccount(acc);
      setFormCodigo(acc.codigo || '');
      setFormNome(acc.nome || '');
      setFormTipo(acc.tipo || 'Ativo');
      setFormNatureza(acc.natureza || 'Devedora');
      setFormAceitaLancamento(acc.aceitaLancamento ?? true);
      setFormAtivo(acc.ativo ?? true);
    } else {
      // Create mode
      setEditingAccount(null);
      setFormNome('');
      setFormTipo(acc?.tipo || 'Ativo');
      setFormNatureza(acc?.natureza || 'Devedora');
      setFormAceitaLancamento(true);
      setFormAtivo(true);

      if (parentCodigo) {
        // Suggest next code for subaccount
        const siblings = accounts.filter(a => {
          const parts = a.codigo.split('.');
          const parentParts = parentCodigo.split('.');
          return parts.length === parentParts.length + 1 && a.codigo.startsWith(parentCodigo + '.');
        });

        if (siblings.length > 0) {
          const lastSibling = siblings[siblings.length - 1];
          const lastParts = lastSibling.codigo.split('.');
          const lastNum = parseInt(lastParts[lastParts.length - 1]);
          const nextNum = (lastNum + 1).toString().padStart(lastParts[lastParts.length - 1].length, '0');
          setFormCodigo(`${parentCodigo}.${nextNum}`);
        } else {
          // First subaccount
          setFormCodigo(`${parentCodigo}.01`);
        }
      } else {
        setFormCodigo('');
      }
    }
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const nivel = formCodigo.split('.').length;
    const accountData: Omit<Account, 'id'> = {
      codigo: formCodigo,
      nome: formNome,
      tipo: formTipo,
      natureza: formNatureza,
      nivel,
      aceitaLancamento: formAceitaLancamento,
      ativo: formAtivo
    };

    try {
      if (editingAccount?.id) {
        await updateAccount(effectivePath, editingAccount.id, accountData);
      } else {
        await createAccount(effectivePath, accountData);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, effectivePath);
    }
  };

  const handleDeleteAccount = async (acc: Account) => {
    // 1) Check for subaccounts
    const hasChildren = accounts.some(a => a.codigo.startsWith(acc.codigo + '.'));
    if (hasChildren) {
      setToast({ message: 'Esta conta possui subcontas e não pode ser excluída.', type: 'error' });
      return;
    }

    // 2) Check for transactions
    try {
      const isUsed = await isAccountUsedInTransactions(acc.id);
      if (isUsed) {
        setToast({ message: 'Esta conta possui lançamentos contábeis e não pode ser excluída.', type: 'error' });
        return;
      }
    } catch (error) {
      console.error('Error checking account usage:', error);
      // Continue if check fails? Or stop? Better stop.
      setToast({ message: 'Erro ao verificar uso da conta.', type: 'error' });
      return;
    }

    // Show confirmation modal
    setAccountToDelete(acc);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteAccount(effectivePath, accountToDelete.id);
      setToast({ message: 'Conta excluída com sucesso.', type: 'success' });
      setAccountToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${effectivePath}/${accountToDelete.id}`);
      setToast({ message: 'Erro ao excluir conta.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTree = useMemo(() => {
    if (!searchTerm) return treeData;

    const searchLower = searchTerm.toLowerCase();
    
    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.reduce((acc: TreeNode[], node) => {
        const matches = node.nome.toLowerCase().includes(searchLower) || node.codigo.includes(searchTerm);
        const filteredChildren = filterNodes(node.children);
        
        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren
          });
        }
        return acc;
      }, []);
    };

    return filterNodes(treeData);
  }, [treeData, searchTerm]);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchTerm) {
      const newExpanded: Record<string, boolean> = {};
      const expandParents = (nodes: TreeNode[]) => {
        nodes.forEach(node => {
          if (node.children.length > 0) {
            newExpanded[node.codigo] = true;
            expandParents(node.children);
          }
        });
      };
      expandParents(filteredTree);
      setExpandedNodes(newExpanded);
    }
  }, [searchTerm, filteredTree]);

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes[node.codigo];
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`group flex items-center py-2 px-4 hover:bg-blue-50/50 border-l-2 transition-all ${
            node.aceitaLancamento ? 'border-transparent' : 'border-blue-200'
          }`}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          <div className="flex items-center gap-2 flex-grow">
            <div className="w-6 flex justify-center">
              {hasChildren ? (
                <button 
                  onClick={() => toggleNode(node.codigo)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-gray-400"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-4" />
              )}
            </div>

            <div className={`flex items-center gap-2 ${node.aceitaLancamento ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
              {node.aceitaLancamento ? (
                <FileText className="w-4 h-4 text-gray-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500 fill-blue-500/10" />
              )}
              <span className="font-mono text-sm min-w-[60px]">{node.codigo}</span>
              <span className="truncate">{node.nome}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 ml-4">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                node.tipo === 'Ativo' ? 'bg-blue-50 text-blue-700' :
                node.tipo === 'Passivo' ? 'bg-orange-50 text-orange-700' :
                node.tipo === 'Receita' ? 'bg-emerald-50 text-emerald-700' :
                node.tipo === 'Despesa' ? 'bg-red-50 text-red-700' :
                'bg-purple-50 text-purple-700'
              }`}>
                {node.tipo}
              </span>
              {node.aceitaLancamento && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                  Analítica
                </span>
              )}
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              onClick={() => handleOpenModal(node)}
              className="p-1.5 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {!node.aceitaLancamento && (
              <button
                onClick={() => handleOpenModal({ tipo: node.tipo, natureza: node.natureza }, node.codigo)}
                className="p-1.5 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition-colors"
                title="Adicionar Subconta"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleDeleteAccount(node)}
              className="p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Estrutura do Plano de Contas</h2>
              <p className="text-sm text-gray-500 font-medium">{plano.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={expandAll}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg border border-gray-200 transition-all shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Expandir Tudo
            </button>
            <button 
              onClick={collapseAll}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg border border-gray-200 transition-all shadow-sm"
            >
              <Minimize2 className="w-4 h-4" />
              Recolher Tudo
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-bold"
            >
              <Plus className="w-4 h-4" />
              Nova Conta
            </button>
          </div>
        </div>

        <div className="mt-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Pesquisar por nome ou código da conta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tree Area */}
      <div className="flex-grow overflow-y-auto custom-scrollbar bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium">Carregando estrutura...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Folder className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhuma conta encontrada.</p>
          </div>
        ) : (
          <div className="py-4">
            {filteredTree.map(node => renderNode(node))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir conta contábil</h3>
              <p className="text-gray-500">
                Deseja realmente excluir a conta <span className="font-bold text-gray-900">"{accountToDelete.nome}"</span>?
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setAccountToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-bold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                    placeholder="Ex: 1.1.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nível</label>
                  <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-bold">
                    {formCodigo ? formCodigo.split('.').length : 0}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ex: Caixa Geral"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as Account['tipo'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Passivo">Passivo</option>
                    <option value="PatrimonioLiquido">Patrimônio Líquido</option>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Natureza</label>
                  <select
                    value={formNatureza}
                    onChange={(e) => setFormNatureza(e.target.value as Account['natureza'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Devedora">Devedora</option>
                    <option value="Credora">Credora</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formAceitaLancamento ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Aceita Lançamento</p>
                    <p className="text-xs text-gray-500">Define se a conta é analítica.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAceitaLancamento(!formAceitaLancamento)}
                  className="focus:outline-none"
                >
                  {formAceitaLancamento ? (
                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formAtivo ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Conta Ativa</p>
                    <p className="text-xs text-gray-500">Define se a conta está disponível.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAtivo(!formAtivo)}
                  className="focus:outline-none"
                >
                  {formAtivo ? (
                    <ToggleRight className="w-10 h-10 text-blue-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                >
                  {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
