import { FileText, MinusCircle, PlusCircle, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SummaryCardsProps {
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  isClosed: boolean;
}

export function SummaryCards({ totalEntries, totalDebit, totalCredit, isClosed }: SummaryCardsProps) {
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Total Lançamentos (Mês)</p>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{totalEntries}</h3>
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
            <span className="font-medium">+12.5%</span> em relação ao mês anterior
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Total Débito</p>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <MinusCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalDebit)}</h3>
          <p className="text-sm text-gray-500 mt-2">Consolidado no período</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-gray-500">Total Crédito</p>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(totalCredit)}</h3>
          <p className={cn("text-sm mt-2 flex items-center gap-1", isBalanced ? "text-emerald-600" : "text-amber-600")}>
            <span className="font-medium">{isBalanced ? "Balanço Equilibrado" : "Balanço Desequilibrado"}</span>
          </p>
        </div>
      </div>

      <div className={cn("rounded-2xl p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden", isClosed ? "bg-slate-800" : "bg-blue-600")}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <p className="text-sm font-medium text-blue-100">Status do Período</p>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {isClosed ? <LockKeyhole className="w-5 h-5" /> : <UnlockKeyhole className="w-5 h-5" />}
          </div>
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold">{isClosed ? "Fechado" : "Aberto"}</h3>
          <p className="text-sm text-blue-100 mt-2">
            {isClosed ? "Nenhum lançamento permitido" : "Encerramento em 12 dias"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function for local use if not imported
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
