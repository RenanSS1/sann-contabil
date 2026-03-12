import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp, limit, where, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Entry, NewEntry, Account, Company } from './types';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { EntryForm } from './components/EntryForm';
import { EntriesTable } from './components/EntriesTable';
import { Auth } from './components/Auth';
import { BalancoPatrimonial } from './components/BalancoPatrimonial';
import { DRE } from './components/DRE';
import { Balancete } from './components/Balancete';
import { ChartOfAccountsManager } from './components/ChartOfAccountsManager';
import { AccountsTreeEditor } from './components/AccountsTreeEditor';
import { CompaniesManager } from './components/CompaniesManager';
import { Onboarding } from './components/Onboarding';
import { DashboardAd } from './components/ads/DashboardAd';
import { shouldShowAds } from './utils/adsenseUtils';
import { handleFirestoreError, OperationType } from './utils/errorHandling';
import { updateSelectedCompany } from './services/financeService';

export type TabType = 'empresas' | 'lancamentos' | 'balanco' | 'dre' | 'balancete' | 'planos';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('lancamentos');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch User Profile and Companies
  useEffect(() => {
    if (!isAuthReady || !user) {
      setCompanies([]);
      setUserProfile(null);
      setActiveCompanyId('');
      return;
    }

    // Fetch User Profile
    const userRef = doc(db, 'usuarios', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        if (data.empresaSelecionadaId) {
          setActiveCompanyId(data.empresaSelecionadaId);
        }
      } else {
        // Create user profile if it doesn't exist
        setDoc(userRef, {
          nome: user.displayName || 'Usuário',
          email: user.email,
          criadoEm: serverTimestamp()
        }, { merge: true });
      }
    });

    // Fetch Companies
    const q = query(collection(db, 'empresas'), where('proprietarioId', '==', user.uid));
    const unsubscribeCompanies = onSnapshot(q, (snapshot) => {
      const comps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Company[];
      setCompanies(comps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'empresas');
    });

    return () => {
      unsubscribeUser();
      unsubscribeCompanies();
    };
  }, [user, isAuthReady]);

  // Handle Company Selection
  const handleSelectCompany = async (id: string) => {
    if (!user) return;
    try {
      await updateSelectedCompany(user.uid, id);
      setActiveCompanyId(id);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'usuarios');
    }
  };

  // Fetch Accounts and Entries for Active Company
  useEffect(() => {
    if (!activeCompanyId) {
      setEntries([]);
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch Accounts
    const activeCompany = companies.find(c => c.id === activeCompanyId);
    if (!activeCompany?.accountPlanId) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    const accountsPath = `planos_contas/${activeCompany.accountPlanId}/contas`;
    const accountsRef = collection(db, accountsPath);
    const unsubscribeAccounts = onSnapshot(accountsRef, (snapshot) => {
      const accountsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      setAccounts(accountsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, accountsPath);
    });

    // Fetch Entries
    const entriesPath = `empresas/${activeCompanyId}/lancamentos`;
    const entriesRef = collection(db, entriesPath);
    const q = query(entriesRef, orderBy('data', 'desc'), limit(500)); // Increased limit for reports
    
    const unsubscribeEntries = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Entry[];
      
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, entriesPath);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeEntries();
    };
  }, [activeCompanyId]);

  const handleAddEntry = async (newEntry: NewEntry) => {
    if (!user || !activeCompanyId) return;
    const entriesPath = `empresas/${activeCompanyId}/lancamentos`;
    try {
      await addDoc(collection(db, entriesPath), {
        ...newEntry,
        criadoEm: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, entriesPath);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user || !activeCompanyId) return;
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const entryPath = `empresas/${activeCompanyId}/lancamentos/${id}`;
      try {
        await deleteDoc(doc(db, `empresas/${activeCompanyId}/lancamentos`, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, entryPath);
      }
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!activeCompanyId) {
    return (
      <Onboarding 
        userId={user.uid} 
        companies={companies} 
        onSelectCompany={handleSelectCompany} 
      />
    );
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthEntries = entries.filter(e => {
    if (!e.data) return false;
    const entryDate = typeof e.data.toDate === 'function' ? e.data.toDate() : new Date(e.data);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const totalDebit = entries.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalCredit = entries.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex flex-col">
      <Navbar 
        user={user} 
        companies={companies} 
        activeCompanyId={activeCompanyId} 
        onSelectCompany={handleSelectCompany}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'empresas' && (
          <CompaniesManager 
            userId={user.uid} 
            onSelectCompany={handleSelectCompany}
            activeCompanyId={activeCompanyId}
          />
        )}

        {activeTab === 'lancamentos' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lançamentos Contábeis</h1>
              <p className="text-gray-500 mt-1">Gerencie e registre as movimentações financeiras da empresa.</p>
            </div>

            <SummaryCards 
              totalEntries={currentMonthEntries.length}
              totalDebit={totalDebit}
              totalCredit={totalCredit}
              isClosed={false}
            />

            {shouldShowAds(userProfile) && (
              <div className="my-8">
                <DashboardAd />
              </div>
            )}

            <EntryForm onSubmit={handleAddEntry} userId={user.uid} accounts={accounts} />

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <EntriesTable entries={entries} accounts={accounts} onDelete={handleDeleteEntry} userProfile={userProfile} />
            )}
          </>
        )}

        {activeTab === 'balanco' && (
          <BalancoPatrimonial entries={entries} accounts={accounts} />
        )}

        {activeTab === 'dre' && (
          <DRE entries={entries} accounts={accounts} />
        )}

        {activeTab === 'balancete' && (
          <Balancete entries={entries} accounts={accounts} />
        )}

        {activeTab === 'planos' && (
          <ChartOfAccountsManager userId={user.uid} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sann Labs. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Ajuda e Suporte</a>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Servidor Online
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
