import { Bell, Settings, Building2 } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Company } from '../types';
import { TabType } from '../App';

interface NavbarProps {
  user: any;
  companies: Company[];
  activeCompanyId: string;
  onSelectCompany: (id: string) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navbar({ user, companies, activeCompanyId, onSelectCompany, activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tighter">
                SL
              </div>
              <span className="font-semibold text-gray-900 text-lg">Sann Contábil</span>
            </div>
            
            {companies.length > 0 && (
              <div className="ml-6 flex items-center">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <select
                    value={activeCompanyId}
                    onChange={(e) => onSelectCompany(e.target.value)}
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer py-0 pl-1 pr-6 outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <button
                onClick={() => onTabChange('empresas')}
                className={`${activeTab === 'empresas' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Empresas
              </button>
              <button
                onClick={() => onTabChange('lancamentos')}
                className={`${activeTab === 'lancamentos' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Lançamentos
              </button>
              <button
                onClick={() => onTabChange('balanco')}
                className={`${activeTab === 'balanco' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Balanço Patrimonial
              </button>
              <button
                onClick={() => onTabChange('dre')}
                className={`${activeTab === 'dre' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                DRE
              </button>
              <button
                onClick={() => onTabChange('balancete')}
                className={`${activeTab === 'balancete' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Balancete
              </button>
              <button
                onClick={() => onTabChange('planos')}
                className={`${activeTab === 'planos' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Modelos de Planos
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="relative ml-2">
              <button 
                onClick={() => signOut(auth)}
                className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                title="Sair"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}&background=0D8ABC&color=fff`}
                  alt="User avatar"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
