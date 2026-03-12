export interface Company {
  id: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
  regimeTributario: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  dataAbertura: string;
  ativa: boolean;
  proprietarioId: string;
  accountPlanId?: string;
  createdAt: any;
}

export interface Entry {
  id: string;
  data: any; // Firestore Timestamp
  descricao: string;
  contaDebito: string;
  contaDebitoInfo: { id: string; codigo: string; nome: string };
  contaCredito: string;
  contaCreditoInfo: { id: string; codigo: string; nome: string };
  valor: number;
  criadoEm: any; // Firestore Timestamp
  criadoPor: string;
}

export interface Account {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'Ativo' | 'Passivo' | 'PatrimonioLiquido' | 'Receita' | 'Despesa';
  natureza: 'Devedora' | 'Credora';
  nivel: number;
  aceitaLancamento: boolean;
  ativo: boolean;
  criadoEm?: any;
}

export interface ChartOfAccounts {
  id: string;
  nome: string;
  descricao: string;
  padrao: boolean;
  userId: string;
  totalContas?: number;
  criadoEm: any;
}

export type NewEntry = Omit<Entry, 'id' | 'criadoEm'>;
