import React, { useState } from 'react';
import { Plus, Globe, Calendar, Hotel, DollarSign, MapPin, Star, Plane, ChevronLeft, ChevronRight, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import apiService from '../../services/api';

const TravelsTab = ({ 
  travels, 
  viagensData, 
  currentTravelPage, 
  setCurrentTravelPage, 
  setSelectedTravel, 
  setShowTravelModal,
  setEditingTravel,
  setShowNewTravelModal,
  activeTravelTab,
  setActiveTravelTab
}) => {
  // Usar o estado do App.jsx em vez do estado local
  const activeSubTab = activeTravelTab || 'planejado';
  const setActiveSubTab = setActiveTravelTab;
  const travelsPerPage = 8;
  const totalPages = Math.ceil(viagensData.length / travelsPerPage);
  const startIndex = (currentTravelPage - 1) * travelsPerPage;
  const currentTravels = viagensData.slice(startIndex, startIndex + travelsPerPage);

  const getStatusColor = (zona) => {
    return zona === 'Schengen' ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';
  };

  const getStatusIcon = (zona) => {
    return zona === 'Schengen' ? '✅' : '🌍';
  };

  return (
    <div className="space-y-6">
      {/* Debug: mostrar dados das viagens */}
      {console.log('TravelsTab - viagensData:', viagensData)}
      {console.log('TravelsTab - currentTravels:', currentTravels)}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl">
            <Globe className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Viagens Planejadas</h2>
            <p className="text-gray-400">Explore o mundo com organização</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {viagensData.length} destinos • Página {currentTravelPage} de {totalPages}
          </span>
          <button 
            onClick={() => setShowNewTravelModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={20} />
            Nova Viagem
          </button>
        </div>
      </div>

      {/* Sub-navegação das 3 abas */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSubTab('planejado')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeSubTab === 'planejado'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Calendar size={18} />
            <span className="font-medium">Planejado</span>
          </button>
          <button
            onClick={() => setActiveSubTab('realizado')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeSubTab === 'realizado'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <CheckCircle size={18} />
            <span className="font-medium">Realizado</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analise')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeSubTab === 'analise'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <BarChart3 size={18} />
            <span className="font-medium">Análise</span>
          </button>
        </div>
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeSubTab === 'planejado' && (
        <>
          {/* Cards de Viagens Planejadas - 8 por página */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentTravels.map((viagem, index) => (
          <div 
            key={viagem.id} 
            className="bg-gray-800/40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-700/50"
            onClick={() => {
              setSelectedTravel(viagem);
              setShowTravelModal(true);
            }}
          >
            {/* Header do Card */}
            <div className={`h-32 ${getStatusColor(viagem.zona).includes('green') ? 'bg-green-600' : 'bg-blue-600'} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  {getStatusIcon(viagem.zona)} Confirmada
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-bold text-white text-xl mb-1">{viagem.cidade || viagem.Cidade || 'Destino'}</h3>
                <div className="flex items-center gap-2 text-white text-sm opacity-90">
                  <Calendar size={14} />
                  <span>
                    {viagem.inicio ? new Date(viagem.inicio).toLocaleDateString('pt-BR') : 
                     viagem.Início ? new Date(viagem.Início).toLocaleDateString('pt-BR') : 'Data início'} - 
                    {viagem.fim ? new Date(viagem.fim).toLocaleDateString('pt-BR') : 
                     viagem.Fim ? new Date(viagem.Fim).toLocaleDateString('pt-BR') : 'Data fim'}
                  </span>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 space-y-4">
              {/* Orçamento e Hospedagem */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="text-green-400" size={14} />
                    <span className="text-gray-400 text-xs">Orçamento</span>
                  </div>
                  <span className="text-white font-semibold text-lg">R$ {(viagem.total || viagem.Total || viagem.distotal || 0).toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Hotel className="text-blue-400" size={14} />
                    <span className="text-gray-400 text-xs">Hospedagem</span>
                  </div>
                  <span className="text-white font-semibold text-lg">R$ {(viagem.hospedagem || viagem.Hospedagem || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Orçamento Total Planejado */}
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Orçamento total:</span>
                  <span className="text-blue-400 font-semibold">R$ {(viagem.total || viagem.Total || viagem.distotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Planejamento base</span>
                  <span>{viagem.dias_semana || viagem.Dias_semana || 7} dias</span>
                </div>
              </div>

              {/* Atividades Planejadas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-purple-400" size={14} />
                  <span className="text-gray-400 text-sm font-medium">Região</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {viagem.zona || viagem.Zona || 'Região'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={14} fill="currentColor" />
                    <span className="text-yellow-400 text-sm font-medium">{viagem.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Transporte */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Plane className="text-blue-400" size={14} />
                  <span className="text-gray-400">Ensolarado, 22°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🌤️</span>
                  <span className="text-gray-400">Voo + Metrô</span>
                </div>
              </div>

                             {/* Botão Ver Detalhes (somente visualização) */}
               <div className="pt-2">
                 <button 
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedTravel(viagem);
                     setShowTravelModal(true);
                   }}
                 >
                   Ver Detalhes
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-center gap-2 py-4">
        <button
          onClick={() => setCurrentTravelPage(prev => Math.max(prev - 1, 1))}
          disabled={currentTravelPage === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentTravelPage(i + 1)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTravelPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentTravelPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentTravelPage === totalPages}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          Próxima
          <ChevronRight size={16} />
        </button>
      </div>
        </>
      )}

      {/* Aba Realizado */}
      {activeSubTab === 'realizado' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Viagens Realizadas</h3>
            <p className="text-gray-400 mb-4">Registre seus gastos reais e status de confirmação</p>
            
            {/* Cards de Viagens Realizadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {currentTravels.map((viagem, index) => (
                <div 
                  key={`realizado-${viagem.id}`} 
                  className="bg-gray-800/40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-700/50"
                  onClick={() => {
                    setSelectedTravel(viagem);
                    setShowTravelModal(true);
                  }}
                >
                  {/* Header do Card Realizado */}
                  <div className="h-32 bg-green-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`${viagem.confirmada ? 'bg-green-500' : 'bg-yellow-500'} bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
                        {viagem.confirmada ? <CheckCircle size={14} /> : <Clock size={14} />} 
                        {viagem.confirmada ? 'Confirmada' : 'A confirmar'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-white text-xl mb-1">{viagem.cidade || viagem.Cidade || 'Destino'}</h3>
                      <div className="flex items-center gap-2 text-white text-sm opacity-90">
                        <Calendar size={14} />
                        <span>
                          {viagem.inicio ? new Date(viagem.inicio).toLocaleDateString('pt-BR') : 
                           viagem.Início ? new Date(viagem.Início).toLocaleDateString('pt-BR') : 'Data início'} - 
                          {viagem.fim ? new Date(viagem.fim).toLocaleDateString('pt-BR') : 
                           viagem.Fim ? new Date(viagem.Fim).toLocaleDateString('pt-BR') : 'Data fim'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Card Realizado */}
                  <div className="p-4 space-y-3">
                    {/* Gasto Real (valores reais do banco) */}
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm font-medium">Gasto real:</span>
                        <span className="text-gray-500 font-semibold">
                          R$ {(viagem.total_realizado || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gray-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${viagem.total_realizado > 0 ? Math.min((viagem.total_realizado / (viagem.total_planejado || 1)) * 100, 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {viagem.total_realizado > 0 ? 'Gastos registrados' : 'Preencha os gastos reais'}
                      </div>
                    </div>

                    {/* Informação de Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status:</span>
                      <span className={`text-sm ${viagem.confirmada ? 'text-green-400' : 'text-yellow-400'}`}>
                        {viagem.confirmada ? 'Confirmada' : 'A confirmar'}
                      </span>
                    </div>

                    {/* Botão Editar Viagem */}
                    <div className="pt-2">
                      <button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTravel(viagem);
                        }}
                      >
                        Editar Viagem
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação Realizado */}
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setCurrentTravelPage(prev => Math.max(prev - 1, 1))}
                disabled={currentTravelPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentTravelPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentTravelPage === i + 1
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentTravelPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentTravelPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba Análise */}
      {activeSubTab === 'analise' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <BarChart3 className="mx-auto text-purple-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Análise Comparativa</h3>
            <p className="text-gray-400 mb-4">Compare o planejado vs realizado</p>
            
            {/* Cards de Análise */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentTravels.map((viagem, index) => (
                <div 
                  key={`analise-${viagem.id}`} 
                  className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50"
                >
                  <h4 className="font-bold text-white text-lg mb-4">{viagem.cidade || viagem.Cidade || 'Destino'}</h4>
                  
                  {/* Comparativo Financeiro */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Planejado:</span>
                      <span className="text-blue-400 font-semibold">R$ {(viagem.total || viagem.Total || viagem.distotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Realizado:</span>
                      <span className="text-gray-500 font-semibold">
                        R$ {(viagem.total_realizado || viagem.Total_realizado || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Diferença:</span>
                        <span className="font-semibold text-blue-400">
                          R$ {((viagem.total_planejado || viagem.total || viagem.Total || viagem.distotal || 0) - (viagem.total_realizado || viagem.Total_realizado || 0)).toLocaleString()} disponível
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação Análise */}
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setCurrentTravelPage(prev => Math.max(prev - 1, 1))}
                disabled={currentTravelPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentTravelPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentTravelPage === i + 1
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentTravelPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentTravelPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:bg-gray-800 disabled:text-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelsTab;


