import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800/50 border-b border-gray-700/50 p-3 md:p-4">
      <div className="flex items-center justify-center">
        {/* Logo centralizado */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Planner Pro</h1>
          <p className="text-gray-300 text-xs md:text-sm">Seu organizador pessoal completo</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
