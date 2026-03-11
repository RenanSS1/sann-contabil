import { useState, FormEvent } from 'react';
import { PlusSquare, Save } from 'lucide-react';
import { NewEntry, Account } from '../types';

interface EntryFormProps {
  onSubmit: (entry: NewEntry) => void;
  userId: string;
  accounts: Account[];
}

export function EntryForm({ onSubmit, userId, accounts }: EntryFormProps) {
  const [dataStr, setDataStr] = useState('');
  const [valorStr, setValorStr] = useState('');
  const [contaDebito, setContaDebito] = useState('');
  const [contaCredito, setContaCredito] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!dataStr || !valorStr || !contaDebito || !contaCredito || !descricao) return;

    const numericValue = parseFloat(valorStr.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) return;

    // Convert date string (YYYY-MM-DD) to a Date object at noon to avoid timezone shift issues
    const dateObj = new Date(dataStr + 'T12:00:00');

    onSubmit({
      data: dateObj,
      valor: numericValue,
      contaDebito,
      contaCredito,
      descricao,
      criadoPor: userId,
    });

    // Reset form
    setDataStr('');
    setValorStr('');
    setContaDebito('');
    setContaCredito('');
    setDescricao('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-600 p-1.5 rounded-md text-white">
          <PlusSquare className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Novo Lançamento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              required
              value={dataStr}
              onChange={(e) => setDataStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              value={valorStr}
              onChange={(e) => setValorStr(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta Débito</label>
            <select
              required
              value={contaDebito}
              onChange={(e) => setContaDebito(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="" disabled>Selecione a conta...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.codigo} - {acc.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta Crédito</label>
            <select
              required
              value={contaCredito}
              onChange={(e) => setContaCredito(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="" disabled>Selecione a conta...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.codigo} - {acc.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Descreva a operação..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="lg:col-span-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/20"
            >
              <Save className="w-5 h-5" />
              Salvar Lançamento
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
