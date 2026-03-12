import { useState, FormEvent, useRef } from 'react';
import { PlusSquare, Save } from 'lucide-react';
import { NewEntry, Account } from '../types';
import { AccountCombobox } from './AccountCombobox';

interface EntryFormProps {
  onSubmit: (entry: NewEntry) => void;
  userId: string;
  accounts: Account[];
}

export function EntryForm({ onSubmit, userId, accounts }: EntryFormProps) {
  const [dataStr, setDataStr] = useState('');
  const [valorStr, setValorStr] = useState('');
  const [contaDebito, setContaDebito] = useState<Account | null>(null);
  const [contaCredito, setContaCredito] = useState<Account | null>(null);
  const [descricao, setDescricao] = useState('');

  const contaDebitoRef = useRef<HTMLInputElement>(null);
  const contaCreditoRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);

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
      contaDebito: contaDebito.id,
      contaDebitoInfo: { id: contaDebito.id, codigo: contaDebito.codigo, nome: contaDebito.nome },
      contaCredito: contaCredito.id,
      contaCreditoInfo: { id: contaCredito.id, codigo: contaCredito.codigo, nome: contaCredito.nome },
      descricao,
      criadoPor: userId,
    });

    // Reset form
    setDataStr('');
    setValorStr('');
    setContaDebito(null);
    setContaCredito(null);
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
          <AccountCombobox 
            ref={contaDebitoRef}
            nextInputRef={contaCreditoRef}
            accounts={accounts} 
            selectedAccountId={contaDebito?.id || ''} 
            onSelect={setContaDebito}
            label="Conta Débito"
          />
          <AccountCombobox 
            ref={contaCreditoRef}
            nextInputRef={descricaoRef}
            accounts={accounts} 
            selectedAccountId={contaCredito?.id || ''} 
            onSelect={setContaCredito}
            label="Conta Crédito"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              ref={descricaoRef}
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
