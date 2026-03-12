import { Entry, Account } from '../types';

export function calculateAccountBalance(accountId: string, account: Account, entries: Entry[]): number {
  let totalDebit = 0;
  let totalCredit = 0;

  entries.forEach(entry => {
    if (entry.contaDebito === accountId) {
      totalDebit += entry.valor;
    }
    if (entry.contaCredito === accountId) {
      totalCredit += entry.valor;
    }
  });

  if (account.natureza === 'Devedora') {
    return totalDebit - totalCredit;
  } else {
    return totalCredit - totalDebit;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
