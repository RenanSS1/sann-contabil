import { Edit2, Trash2, History } from 'lucide-react';
import { Entry, Account } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface EntriesTableProps {
  entries: Entry[];
  accounts: Account[];
  onDelete: (id: string) => void;
}

export function EntriesTable({ entries, accounts, onDelete }: EntriesTableProps) {
  const getAccountName = (id: string) => {
    const account = accounts.find(a => a.id === id);
    return account ? account.nome : 'Desconhecida';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Últimos Lançamentos</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conta Débito</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conta Crédito</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(entry.data)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                    {entry.contaDebitoInfo?.nome || getAccountName(entry.contaDebito)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                    {entry.contaCreditoInfo?.nome || getAccountName(entry.contaCredito)}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(entry.valor)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 max-w-xs truncate">
                    {entry.descricao}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Excluir lançamento"
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

      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
        <p>Mostrando {entries.length} lançamentos</p>
      </div>
    </div>
  );
}
