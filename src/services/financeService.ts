import { collection, addDoc, serverTimestamp, getDocs, query, where, limit, updateDoc, doc, deleteDoc, writeBatch, setDoc, collectionGroup, or } from 'firebase/firestore';
import { db } from '../firebase';
import { Account, ChartOfAccounts, Company } from '../types';

export const DEFAULT_ACCOUNTS_DATA: Omit<Account, 'id'>[] = [
  // 1 - ATIVO
  { codigo: '1', nome: 'ATIVO', tipo: 'Ativo', natureza: 'Devedora', nivel: 1, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1', nome: 'ATIVO CIRCULANTE', tipo: 'Ativo', natureza: 'Devedora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.01', nome: 'Caixa', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.02', nome: 'Bancos', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.03', nome: 'Aplicações Financeiras', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.04', nome: 'Clientes', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.05', nome: 'Estoques', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.06', nome: 'Impostos a Recuperar', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.1.07', nome: 'Adiantamentos a Fornecedores', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  { codigo: '1.2', nome: 'ATIVO NÃO CIRCULANTE', tipo: 'Ativo', natureza: 'Devedora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.01', nome: 'Investimentos', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02', nome: 'Imobilizado', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.01', nome: 'Terrenos', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.02', nome: 'Edificações', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.03', nome: 'Máquinas e Equipamentos', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.04', nome: 'Veículos', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.05', nome: 'Móveis e Utensílios', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.06', nome: 'Equipamentos de Informática', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.02.07', nome: 'Instalações', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.03', nome: 'Intangível', tipo: 'Ativo', natureza: 'Devedora', nivel: 3, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.03.01', nome: 'Software', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '1.2.03.02', nome: 'Marcas e Patentes', tipo: 'Ativo', natureza: 'Devedora', nivel: 4, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  // 2 - PASSIVO
  { codigo: '2', nome: 'PASSIVO', tipo: 'Passivo', natureza: 'Credora', nivel: 1, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1', nome: 'PASSIVO CIRCULANTE', tipo: 'Passivo', natureza: 'Credora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.01', nome: 'Fornecedores', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.02', nome: 'Salários a Pagar', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.03', nome: 'INSS a Recolher', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.04', nome: 'FGTS a Recolher', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.05', nome: 'Impostos a Recolher', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.06', nome: 'Empréstimos Bancários', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.1.07', nome: 'Cartões a Pagar', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  { codigo: '2.2', nome: 'PASSIVO NÃO CIRCULANTE', tipo: 'Passivo', natureza: 'Credora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.2.01', nome: 'Financiamentos', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '2.2.02', nome: 'Parcelamentos Tributários', tipo: 'Passivo', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  // 3 - PATRIMONIO LIQUIDO
  { codigo: '3', nome: 'PATRIMONIO LIQUIDO', tipo: 'PatrimonioLiquido', natureza: 'Credora', nivel: 1, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '3.1', nome: 'Capital Social', tipo: 'PatrimonioLiquido', natureza: 'Credora', nivel: 2, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '3.2', nome: 'Reservas de Capital', tipo: 'PatrimonioLiquido', natureza: 'Credora', nivel: 2, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '3.3', nome: 'Lucros Acumulados', tipo: 'PatrimonioLiquido', natureza: 'Credora', nivel: 2, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '3.4', nome: 'Prejuízos Acumulados', tipo: 'PatrimonioLiquido', natureza: 'Credora', nivel: 2, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  // 4 - RECEITAS
  { codigo: '4', nome: 'RECEITAS', tipo: 'Receita', natureza: 'Credora', nivel: 1, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.1', nome: 'Receita de Vendas', tipo: 'Receita', natureza: 'Credora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.1.01', nome: 'Vendas de Mercadorias', tipo: 'Receita', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.1.02', nome: 'Vendas de Produtos', tipo: 'Receita', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.2', nome: 'Receita de Serviços', tipo: 'Receita', natureza: 'Credora', nivel: 2, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.3', nome: 'Receitas Financeiras', tipo: 'Receita', natureza: 'Credora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.3.01', nome: 'Juros Recebidos', tipo: 'Receita', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '4.3.02', nome: 'Rendimentos Aplicações', tipo: 'Receita', natureza: 'Credora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  // 5 - DESPESAS
  { codigo: '5', nome: 'DESPESAS', tipo: 'Despesa', natureza: 'Devedora', nivel: 1, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1', nome: 'Despesas Administrativas', tipo: 'Despesa', natureza: 'Devedora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1.01', nome: 'Aluguel', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1.02', nome: 'Energia Elétrica', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1.03', nome: 'Internet', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1.04', nome: 'Material de Escritório', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.1.05', nome: 'Telefonia', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  { codigo: '5.2', nome: 'Despesas com Pessoal', tipo: 'Despesa', natureza: 'Devedora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.2.01', nome: 'Salários', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.2.02', nome: 'INSS', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.2.03', nome: 'FGTS', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.2.04', nome: 'Vale Transporte', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },

  { codigo: '5.3', nome: 'Despesas Financeiras', tipo: 'Despesa', natureza: 'Devedora', nivel: 2, aceitaLancamento: false, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.3.01', nome: 'Juros Bancários', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.3.02', nome: 'Tarifas Bancárias', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
  { codigo: '5.3.03', nome: 'Multas', tipo: 'Despesa', natureza: 'Devedora', nivel: 3, aceitaLancamento: true, ativo: true, criadoEm: serverTimestamp() },
];

export async function seedUserChartsOfAccounts(userId: string) {
  const chartsRef = collection(db, 'planos_contas');
  const q = query(chartsRef, where('userId', '==', userId), where('padrao', '==', true), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    const newChartRef = await addDoc(chartsRef, {
      nome: 'Plano de Contas Padrão Sann',
      descricao: 'Plano de contas básico para pequenas e médias empresas.',
      padrao: true,
      userId,
      totalContas: DEFAULT_ACCOUNTS_DATA.length,
      criadoEm: serverTimestamp()
    });

    const accountsRef = collection(db, `planos_contas/${newChartRef.id}/contas`);
    const promises = DEFAULT_ACCOUNTS_DATA.map(account => addDoc(accountsRef, account));
    await Promise.all(promises);
    
    return newChartRef.id;
  }
  
  return snapshot.docs[0].id;
}

export async function setDefaultChartOfAccounts(id: string, userId: string) {
  const chartsRef = collection(db, 'planos_contas');
  const q = query(chartsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach((docSnap) => {
    const isTarget = docSnap.id === id;
    batch.update(doc(db, 'planos_contas', docSnap.id), {
      padrao: isTarget
    });
  });
  
  await batch.commit();
}

export async function createChartOfAccounts(nome: string, descricao: string, userId: string) {
  const chartsRef = collection(db, 'planos_contas');
  return await addDoc(chartsRef, {
    nome,
    descricao,
    padrao: false,
    userId,
    totalContas: 0,
    criadoEm: serverTimestamp()
  });
}

export async function createChartFromDefault(nome: string, descricao: string, userId: string) {
  const chartsRef = collection(db, 'planos_contas');
  const newChartRef = await addDoc(chartsRef, {
    nome,
    descricao,
    padrao: false,
    userId,
    totalContas: DEFAULT_ACCOUNTS_DATA.length,
    criadoEm: serverTimestamp()
  });

  const accountsRef = collection(db, `planos_contas/${newChartRef.id}/contas`);
  const promises = DEFAULT_ACCOUNTS_DATA.map(account => addDoc(accountsRef, account));
  await Promise.all(promises);
  
  return newChartRef;
}

export async function updateChartOfAccounts(id: string, data: Partial<ChartOfAccounts>) {
  const chartRef = doc(db, 'planos_contas', id);
  const { id: _, ...updateData } = data;
  await updateDoc(chartRef, updateData);
}

export async function deleteChartOfAccounts(id: string) {
  const chartRef = doc(db, 'planos_contas', id);
  await deleteDoc(chartRef);
}

export async function createChartAccount(planoId: string, account: Omit<Account, 'id'>) {
  const path = `planos_contas/${planoId}/contas`;
  const newDoc = await createAccount(path, account);

  // Update total count
  const chartRef = doc(db, 'planos_contas', planoId);
  const snapshot = await getDocs(collection(db, path));
  await updateDoc(chartRef, { totalContas: snapshot.size });
  
  return newDoc;
}

export async function updateChartAccount(planoId: string, accountId: string, data: Partial<Account>) {
  const path = `planos_contas/${planoId}/contas`;
  return await updateAccount(path, accountId, data);
}

export async function deleteChartAccount(planoId: string, accountId: string) {
  const path = `planos_contas/${planoId}/contas`;
  await deleteAccount(path, accountId);

  // Update total count
  const chartRef = doc(db, 'planos_contas', planoId);
  const snapshot = await getDocs(collection(db, path));
  await updateDoc(chartRef, { totalContas: snapshot.size });
}

export async function createAccount(path: string, account: Omit<Account, 'id'>) {
  const accountsRef = collection(db, path);
  return await addDoc(accountsRef, {
    ...account,
    criadoEm: serverTimestamp()
  });
}

export async function updateAccount(path: string, accountId: string, data: Partial<Account>) {
  const accountRef = doc(db, path, accountId);
  const { id: _, ...updateData } = data;
  await updateDoc(accountRef, updateData);
}

export async function deleteAccount(path: string, accountId: string) {
  const accountRef = doc(db, path, accountId);
  await deleteDoc(accountRef);
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt'>) {
  const companiesRef = collection(db, 'empresas');
  return await addDoc(companiesRef, {
    ...company,
    createdAt: serverTimestamp()
  });
}

export async function updateCompany(id: string, data: Partial<Company>) {
  const companyRef = doc(db, 'empresas', id);
  const { id: _, ...updateData } = data;
  await updateDoc(companyRef, updateData);
}

export async function deleteCompany(id: string) {
  const companyRef = doc(db, 'empresas', id);
  await deleteDoc(companyRef);
}

export async function updateSelectedCompany(userId: string, companyId: string) {
  const userRef = doc(db, 'usuarios', userId);
  await setDoc(userRef, {
    empresaSelecionadaId: companyId
  }, { merge: true });
}

export async function isAccountUsedInTransactions(accountId: string) {
  // Check across all companies using collectionGroup
  const entriesRef = collectionGroup(db, 'lancamentos');
  
  // Check if account is used as debit or credit
  const q = query(
    entriesRef, 
    or(
      where('contaDebito', '==', accountId),
      where('contaCredito', '==', accountId)
    ),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
