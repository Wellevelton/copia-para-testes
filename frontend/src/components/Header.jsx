import React from 'react';

const Header = ({ activeTab, setActiveTab, setShowUserMenu, showUserMenu, resetToInitialData, onLogout, setShowProfile, setShowSettings }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Planner Pro</h1>
          <p className="text-gray-400 text-sm">Seu organizador pessoal completo</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
