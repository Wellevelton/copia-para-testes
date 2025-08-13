import React, { useState } from 'react';
import { Settings, User, X, BarChart3, Calendar } from 'lucide-react';

const Navigation = ({ 
  activeTab, 
  setActiveTab, 
  setActiveSubTab, 
  setShowProfile, 
  setShowSettings, 
  onLogout,
  showReports,
  setShowReports,
  isGoogleCalendarConnected
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const tabs = [
    { id: 'projects', label: '📋 Projetos & Metas' },
    { id: 'calendar', label: '📅 Agenda & Metas' },
    { id: 'finances', label: '💰 Finanças' },
    { id: 'career', label: '💼 Carreira' },
    { id: 'travels', label: '✈️ Viagens' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Limpar estados de Perfil e Configurações quando navegar para outras abas
    setShowProfile(false);
    setShowSettings(false);
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
    <nav className="bg-gray-800 border-b border-gray-700 px-4">
      <div className="flex items-center justify-between">
        {/* Espaço vazio à esquerda */}
        <div className="flex-1"></div>
        
        {/* Navbar centralizado */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Perfil à direita */}
        <div className="flex items-center justify-end flex-1">
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white text-sm font-medium">wellevelton silva</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 w-48 z-50">
                <button 
                  onClick={() => {
                    setShowProfile(true);
                    setShowSettings(false);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <User size={16} />
                  Perfil
                </button>
                <button 
                  onClick={() => {
                    setShowSettings(true);
                    setShowProfile(false);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Configurações
                </button>
                <button 
                  onClick={() => {
                    setShowReports(!showReports);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <BarChart3 size={16} />
                  Relatórios
                </button>
                <button 
                  onClick={() => {
                    // Conectar Google Calendar
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 transition-colors flex items-center gap-2 ${
                    isGoogleCalendarConnected 
                      ? 'text-green-400 hover:bg-gray-700' 
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  <Calendar size={16} />
                  {isGoogleCalendarConnected ? 'Google Calendar ✓' : 'Conectar Google Calendar'}
                </button>
                <hr className="border-gray-700 my-2" />
                <button 
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
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
