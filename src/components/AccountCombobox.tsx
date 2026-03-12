import { useState, useMemo, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Check } from 'lucide-react';
import { Account } from '../types';

interface AccountComboboxProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelect: (account: Account | null) => void;
  label: string;
  nextInputRef?: React.RefObject<HTMLInputElement | HTMLButtonElement>;
}

export const AccountCombobox = forwardRef<HTMLInputElement, AccountComboboxProps>(({ accounts, selectedAccountId, onSelect, label, nextInputRef }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(acc => acc.aceitaLancamento)
      .filter(acc => 
        acc.codigo.toLowerCase().includes(search.toLowerCase()) ||
        acc.nome.toLowerCase().includes(search.toLowerCase())
      );
  }, [accounts, search]);

  const selectedAccount = useMemo(() => 
    accounts.find(acc => acc.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    if (selectedAccount) {
      setSearch(`[${selectedAccount.codigo}] ${selectedAccount.nome}`);
    } else {
      setSearch('');
    }
  }, [selectedAccount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredAccounts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredAccounts[selectedIndex]) {
        onSelect(filteredAccounts[selectedIndex]);
        setIsOpen(false);
        if (nextInputRef?.current) {
          nextInputRef.current.focus();
        } else {
          (e.target as HTMLInputElement).blur();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        ref={internalInputRef}
        type="text"
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="Buscar conta..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {isOpen && filteredAccounts.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAccounts.map((acc, index) => (
            <div
              key={acc.id}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between ${index === selectedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}
              style={{ paddingLeft: `${(acc.nivel - 1) * 16 + 16}px` }}
              onClick={() => {
                onSelect(acc);
                setIsOpen(false);
              }}
            >
              <span className="text-sm">
                <span className="font-mono font-medium text-gray-500 mr-2">[{acc.codigo}]</span>
                {acc.nome}
              </span>
              {selectedAccountId === acc.id && <Check className="w-4 h-4 text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
