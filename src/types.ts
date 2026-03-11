export interface Company {
  id: string;
  nome: string;
  proprietarioId: string;
  criadoEm: any;
}

export interface Entry {
  id: string;
  data: any; // Firestore Timestamp
  descricao: string;
  contaDebito: string;
  contaCredito: string;
  valor: number;
  criadoEm: any; // Firestore Timestamp
  criadoPor: string;
}

export interface Account {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'ativo' | 'passivo' | 'receita' | 'despesa';
  natureza: 'devedora' | 'credora';
}

export type NewEntry = Omit<Entry, 'id' | 'criadoEm'>;
