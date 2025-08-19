import React, { useState } from 'react';
import { BarChart3, User, Settings, X } from 'lucide-react';

const Navigation = ({ 
  activeTab, 
  setActiveTab, 
  setActiveSubTab, 
  setShowProfile, 
  setShowSettings, 
  onLogout,
  isGoogleCalendarConnected,
  userName
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  console.log('Navigation renderizado com activeTab:', activeTab);
  
  const tabs = [
    { id: 'projects', label: '📋 Metas' },
    { id: 'calendar', label: '📅 Calendário' },
    { id: 'finances', label: '💰 Finanças' },
    { id: 'career', label: '💼 Carreira' },
    { id: 'travels', label: '✈️ Viagens' }
  ];

  const handleTabClick = (tabId) => {
    console.log('Clicou na aba:', tabId, 'activeTab atual:', activeTab);
    
    // Força mudança do activeTab SEMPRE
    setActiveTab(tabId);
    
    // Limpar TODOS os estados quando navegar para outras abas
    setShowProfile(false);
    setShowSettings(false);
    
    // Fechar menu do usuário se estiver aberto
    setShowUserMenu(false);
    
    if (tabId === 'calendar') {
      setActiveSubTab('calendar');
    } else if (tabId === 'finances') {
      setActiveSubTab('transactions');
    } else {
      setActiveSubTab('');
    }
  };

  return (
    <nav className="bg-gray-800/30 border-b border-gray-700/50 px-2 md:px-4">
      <div className="flex items-center justify-between">
        {/* Espaço vazio à esquerda */}
        <div className="flex-1"></div>
        
        {/* Navbar centralizado */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('CLICK DETECTADO na aba:', tab.id);
                  handleTabClick(tab.id);
                }}
                className={`px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-600 hover:bg-gray-700/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Menu do Usuário à direita */}
        <div className="flex items-center justify-end flex-1 gap-2">

          {/* Menu do Usuário */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              <div className="w-6 h-6 bg-purple-600/80 rounded-full flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="text-white text-xs font-medium hidden md:block">{userName || 'Usuário'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 w-44 z-50">
                <button 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfile(false);
                    setShowSettings(false);
                    setShowReports(false);
                    setShowUserMenu(false);
                    setActiveSubTab('');
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
                >
                  <User size={14} />
                  Perfil
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('settings');
                    setShowSettings(false);
                    setShowProfile(false);
                    setShowUserMenu(false);
                    setActiveSubTab('');
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
                >
                  <Settings size={14} />
                  Configurações
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('reports');
                    setShowSettings(false);
                    setShowProfile(false);
                    setShowUserMenu(false);
                    setActiveSubTab('');
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
                >
                  <BarChart3 size={14} />
                  Relatórios
                </button>

                <hr className="border-gray-700/50 my-2" />
                <button 
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2"
                >
                  <X size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
