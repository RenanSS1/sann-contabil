import { Entry, Account } from '../types';
import { calculateAccountBalance, formatCurrency } from '../utils/accounting';

interface DREProps {
  entries: Entry[];
  accounts: Account[];
}

export function DRE({ entries, accounts }: DREProps) {
  const receitas = accounts.filter(a => a.tipo === 'Receita');
  const despesas = accounts.filter(a => a.tipo === 'Despesa');

  const receitasComSaldo = receitas.map(acc => ({
    ...acc,
    saldo: calculateAccountBalance(acc.id, acc, entries)
  })).filter(acc => acc.saldo !== 0);

  const despesasComSaldo = despesas.map(acc => ({
    ...acc,
    saldo: calculateAccountBalance(acc.id, acc, entries)
  })).filter(acc => acc.saldo !== 0);

  const totalReceitas = receitasComSaldo.reduce((acc, curr) => acc + curr.saldo, 0);
  const totalDespesas = despesasComSaldo.reduce((acc, curr) => acc + curr.saldo, 0);
  
  const resultadoExercicio = totalReceitas - totalDespesas;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Demonstrativo de Resultado (DRE)</h2>
        <p className="text-sm text-gray-500 mt-1">Visão analítica de lucros e despesas.</p>
      </div>

      <div className="p-6">
        {/* Receitas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-emerald-700 border-b border-gray-200 pb-2 mb-4">Receitas</h3>
          <div className="space-y-3">
            {receitasComSaldo.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhuma receita registrada.</p>
            ) : (
              receitasComSaldo.map(acc => (
                <div key={acc.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{acc.codigo} - {acc.nome}</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(acc.saldo)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="font-bold text-gray-900">Total de Receitas</span>
            <span className="font-bold text-emerald-600">{formatCurrency(totalReceitas)}</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-700 border-b border-gray-200 pb-2 mb-4">Despesas</h3>
          <div className="space-y-3">
            {despesasComSaldo.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhuma despesa registrada.</p>
            ) : (
              despesasComSaldo.map(acc => (
                <div key={acc.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{acc.codigo} - {acc.nome}</span>
                  <span className="font-medium text-red-600">{formatCurrency(acc.saldo)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="font-bold text-gray-900">Total de Despesas</span>
            <span className="font-bold text-red-600">{formatCurrency(totalDespesas)}</span>
          </div>
        </div>

        {/* Resultado */}
        <div className={`p-6 rounded-lg border ${resultadoExercicio >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Resultado do Exercício</span>
            <span className={`text-2xl font-bold ${resultadoExercicio >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(resultadoExercicio)}
            </span>
          </div>
          <p className={`text-sm mt-1 ${resultadoExercicio >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {resultadoExercicio >= 0 ? 'Lucro Líquido' : 'Prejuízo Líquido'}
          </p>
        </div>
      </div>
    </div>
  );
}
