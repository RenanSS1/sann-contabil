import { Entry, Account } from '../types';
import { formatCurrency } from '../utils/accounting';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface BalanceteProps {
  entries: Entry[];
  accounts: Account[];
}

export function Balancete({ entries, accounts }: BalanceteProps) {
  const balanceteData = accounts.map(acc => {
    let debitos = 0;
    let creditos = 0;

    entries.forEach(entry => {
      if (entry.contaDebito === acc.id) debitos += entry.valor;
      if (entry.contaCredito === acc.id) creditos += entry.valor;
    });

    let saldoAtual = 0;
    if (acc.natureza === 'devedora') {
      saldoAtual = debitos - creditos;
    } else {
      saldoAtual = creditos - debitos;
    }

    return {
      ...acc,
      debitos,
      creditos,
      saldoAtual
    };
  }).filter(acc => acc.debitos > 0 || acc.creditos > 0 || acc.saldoAtual !== 0)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const totalDebitos = balanceteData.reduce((acc, curr) => acc + curr.debitos, 0);
  const totalCreditos = balanceteData.reduce((acc, curr) => acc + curr.creditos, 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Balancete de Verificação', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const tableColumn = ["Código", "Conta", "Tipo", "Débitos", "Créditos", "Saldo Atual"];
    const tableRows = balanceteData.map(acc => [
      acc.codigo,
      acc.nome,
      acc.tipo.toUpperCase(),
      formatCurrency(acc.debitos),
      formatCurrency(acc.creditos),
      formatCurrency(acc.saldoAtual)
    ]);

    tableRows.push([
      '',
      'TOTAIS',
      '',
      formatCurrency(totalDebitos),
      formatCurrency(totalCreditos),
      ''
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 138, 188] },
    });

    doc.save(`balancete_${new Date().getTime()}.pdf`);
  };

  const exportXLS = () => {
    const wsData = balanceteData.map(acc => ({
      'Código': acc.codigo,
      'Conta': acc.nome,
      'Tipo': acc.tipo.toUpperCase(),
      'Débitos': acc.debitos,
      'Créditos': acc.creditos,
      'Saldo Atual': acc.saldoAtual
    }));

    wsData.push({
      'Código': '',
      'Conta': 'TOTAIS',
      'Tipo': '',
      'Débitos': totalDebitos,
      'Créditos': totalCreditos,
      'Saldo Atual': 0
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balancete");
    
    XLSX.writeFile(wb, `balancete_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Balancete de Verificação</h2>
          <p className="text-sm text-gray-500 mt-1">Verificação de saldos devedores e credores.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="w-4 h-4 mr-2 text-red-500" />
            Exportar PDF
          </button>
          <button
            onClick={exportXLS}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
            Exportar XLS
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conta
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Débitos
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créditos
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Atual
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balanceteData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum dado para exibir no balancete.
                </td>
              </tr>
            ) : (
              balanceteData.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {acc.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {acc.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(acc.debitos)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(acc.creditos)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    acc.saldoAtual > 0 ? 'text-blue-600' : acc.saldoAtual < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(acc.saldoAtual)}
                    {acc.saldoAtual !== 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        {acc.natureza === 'devedora' ? (acc.saldoAtual > 0 ? 'D' : 'C') : (acc.saldoAtual > 0 ? 'C' : 'D')}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {balanceteData.length > 0 && (
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  TOTAIS:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(totalDebitos)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(totalCreditos)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {/* Saldo final não é somado no balancete, apenas os débitos e créditos devem bater */}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      {/* Check Balance */}
      <div className={`p-4 text-center font-medium ${Math.abs(totalDebitos - totalCreditos) < 0.01 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
        {Math.abs(totalDebitos - totalCreditos) < 0.01 
          ? 'Balancete Fechado (Débitos = Créditos)' 
          : `Diferença Encontrada: ${formatCurrency(Math.abs(totalDebitos - totalCreditos))}`}
      </div>
    </div>
  );
}
