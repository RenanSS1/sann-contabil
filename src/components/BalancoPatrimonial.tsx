import { Entry, Account } from '../types';
import { calculateAccountBalance, formatCurrency } from '../utils/accounting';

interface BalancoPatrimonialProps {
  entries: Entry[];
  accounts: Account[];
}

export function BalancoPatrimonial({ entries, accounts }: BalancoPatrimonialProps) {
  const ativos = accounts.filter(a => a.tipo === 'Ativo');
  const passivos = accounts.filter(a => a.tipo === 'Passivo');
  const pl = accounts.filter(a => a.tipo === 'PatrimonioLiquido');

  const ativosComSaldo = ativos.map(acc => ({
    ...acc,
    saldo: calculateAccountBalance(acc.id, acc, entries)
  })).filter(acc => acc.saldo !== 0);

  const passivosComSaldo = passivos.map(acc => ({
    ...acc,
    saldo: calculateAccountBalance(acc.id, acc, entries)
  })).filter(acc => acc.saldo !== 0);

  const plComSaldo = pl.map(acc => ({
    ...acc,
    saldo: calculateAccountBalance(acc.id, acc, entries)
  })).filter(acc => acc.saldo !== 0);

  const totalAtivo = ativosComSaldo.reduce((acc, curr) => acc + curr.saldo, 0);
  const totalPassivo = passivosComSaldo.reduce((acc, curr) => acc + curr.saldo, 0);
  const totalPL = plComSaldo.reduce((acc, curr) => acc + curr.saldo, 0);

  // Calculate Lucro/Prejuízo from DRE to add to Patrimônio Líquido
  const receitas = accounts.filter(a => a.tipo === 'Receita');
  const despesas = accounts.filter(a => a.tipo === 'Despesa');
  
  const totalReceitas = receitas.reduce((acc, curr) => acc + calculateAccountBalance(curr.id, curr, entries), 0);
  const totalDespesas = despesas.reduce((acc, curr) => acc + calculateAccountBalance(curr.id, curr, entries), 0);
  
  const resultadoExercicio = totalReceitas - totalDespesas;
  const totalPassivoEPL = totalPassivo + totalPL + resultadoExercicio;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Balanço Patrimonial</h2>
        <p className="text-sm text-gray-500 mt-1">Posição financeira estruturada de ativos e passivos.</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ativo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Ativo</h3>
          <div className="space-y-3">
            {ativosComSaldo.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum saldo no ativo.</p>
            ) : (
              ativosComSaldo.map(acc => (
                <div key={acc.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{acc.codigo} - {acc.nome}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(acc.saldo)}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
            <span className="font-bold text-gray-900">Total do Ativo</span>
            <span className="font-bold text-blue-600">{formatCurrency(totalAtivo)}</span>
          </div>
        </div>

        {/* Passivo e PL */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Passivo e Patrimônio Líquido</h3>
          <div className="space-y-3">
            {passivosComSaldo.length === 0 && plComSaldo.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum saldo no passivo ou PL.</p>
            ) : (
              <>
                {passivosComSaldo.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{acc.codigo} - {acc.nome}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(acc.saldo)}</span>
                  </div>
                ))}
                {plComSaldo.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{acc.codigo} - {acc.nome}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(acc.saldo)}</span>
                  </div>
                ))}
              </>
            )}
            
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">Resultado do Exercício (Lucro/Prejuízo)</span>
                <span className={`font-medium ${resultadoExercicio >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(resultadoExercicio)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
            <span className="font-bold text-gray-900">Total do Passivo + PL</span>
            <span className="font-bold text-blue-600">{formatCurrency(totalPassivoEPL)}</span>
          </div>
        </div>
      </div>
      
      {/* Check Balance */}
      <div className={`p-4 text-center font-medium ${Math.abs(totalAtivo - totalPassivoEPL) < 0.01 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        {Math.abs(totalAtivo - totalPassivoEPL) < 0.01 
          ? 'Balanço Fechado (Ativo = Passivo + PL)' 
          : `Diferença Encontrada: ${formatCurrency(Math.abs(totalAtivo - totalPassivoEPL))}`}
      </div>
    </div>
  );
}
