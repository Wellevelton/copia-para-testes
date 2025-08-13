import React from 'react';
import { Plus, Globe, Calendar, Hotel, DollarSign, MapPin, Star, Plane, ChevronLeft, ChevronRight } from 'lucide-react';

const TravelsTab = ({ 
  travels, 
  viagensData, 
  currentTravelPage, 
  setCurrentTravelPage, 
  setSelectedTravel, 
  setShowTravelModal,
  setEditingTravel,
  setShowNewTravelModal
}) => {
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

      {/* Cards de Viagens - 8 por página */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentTravels.map((viagem, index) => (
          <div 
            key={viagem.id} 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-700"
            onClick={() => {
              setSelectedTravel(viagem);
              setShowTravelModal(true);
            }}
          >
            {/* Header do Card */}
            <div className={`h-32 bg-gradient-to-br ${getStatusColor(viagem.zona)} relative overflow-hidden`}>
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
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="text-green-400" size={14} />
                    <span className="text-gray-400 text-xs">Orçamento</span>
                  </div>
                  <span className="text-white font-semibold text-lg">R$ {(viagem.total || viagem.Total || viagem.distotal || 0).toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Hotel className="text-blue-400" size={14} />
                    <span className="text-gray-400 text-xs">Hospedagem</span>
                  </div>
                  <span className="text-white font-semibold text-lg">R$ {(viagem.hospedagem || viagem.Hospedagem || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Gasto Atual */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Gasto atual:</span>
                  <span className="text-green-400 font-semibold">R$ {((viagem.hospedagem || viagem.Hospedagem || 0) + (viagem.alimentacao || viagem.Alimentação || 0) + (viagem.transporte || viagem.Transporte || 0)).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((((viagem.hospedagem || viagem.Hospedagem || 0) + (viagem.alimentacao || viagem.Alimentação || 0) + (viagem.transporte || viagem.Transporte || 0)) / (viagem.total || viagem.Total || viagem.distotal || 1)) * 100, 100)}%` }}
                  ></div>
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

                             {/* Botão Mais Detalhes */}
               <div className="pt-2">
                 <button 
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedTravel(viagem);
                     setShowTravelModal(true);
                   }}
                 >
                   Mais Detalhes
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
    </div>
  );
};

export default TravelsTab;


