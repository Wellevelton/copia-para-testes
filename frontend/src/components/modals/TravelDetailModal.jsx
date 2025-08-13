import React from 'react';
import { X, Calendar, Clock, DollarSign, Hotel, MapPin, Star, Edit, Save } from 'lucide-react';

const TravelDetailModal = ({ selectedTravel, setShowTravelModal, viagensData, setEditingTravel, setShowEditTravelModal }) => {
  if (!selectedTravel) return null;

  const calculateDuration = () => {
    try {
      const start = new Date(selectedTravel.inicio);
      const end = new Date(selectedTravel.fim);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 7; // Valor padrão se as datas não forem válidas
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className={`bg-gradient-to-br ${selectedTravel.zona === 'Schengen' ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600'} p-6 relative`}>
          <button 
            onClick={() => setShowTravelModal(false)} 
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedTravel.cidade || 'Destino'}</h2>
              <div className="flex items-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>
                    {selectedTravel.inicio ? new Date(selectedTravel.inicio).toLocaleDateString('pt-BR') : 'Data início'} - 
                    {selectedTravel.fim ? new Date(selectedTravel.fim).toLocaleDateString('pt-BR') : 'Data fim'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{calculateDuration()} dias</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-300" size={20} fill="currentColor" />
                <span className="text-2xl font-bold">{selectedTravel.rating || 'N/A'}</span>
              </div>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {selectedTravel.zona}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-6">
          {/* Resumo de Custos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Total da Viagem</h3>
                <DollarSign size={24} />
              </div>
              <p className="text-2xl font-bold">R$ {(selectedTravel.total || selectedTravel.distotal || 0).toLocaleString()}</p>
              <p className="text-green-200 text-sm">Custo completo</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Hospedagem</h3>
                <Hotel size={24} />
              </div>
              <p className="text-2xl font-bold">R$ {(selectedTravel.hospedagem || 0).toLocaleString()}</p>
              <p className="text-blue-200 text-sm">{Math.round(((selectedTravel.hospedagem || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}% do total</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Por Dia</h3>
                <Calendar size={24} />
              </div>
              <p className="text-2xl font-bold">R$ {Math.round(((selectedTravel.total || selectedTravel.distotal || 0) / calculateDuration())).toLocaleString()}</p>
              <p className="text-purple-200 text-sm">Custo médio diário</p>
            </div>
          </div>

          {/* Detalhamento de Custos */}
          <div className="bg-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
              <DollarSign className="text-blue-400" size={24} />
              Detalhamento de Custos
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Hospedagem</span>
                  <Hotel className="text-blue-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.hospedagem || 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Alimentação</span>
                  <span className="text-orange-400">🍽️</span>
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.alimentacao || 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Transporte</span>
                  <span className="text-purple-400">🚗</span>
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.transporte || 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Academia</span>
                  <span className="text-yellow-400">💪</span>
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.academia || 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Suplementos</span>
                  <span className="text-green-400">💊</span>
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.suplementos || 0).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Atividades</span>
                  <MapPin className="text-red-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">R$ {(selectedTravel.atividades || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Gráfico de Pizza Visual */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Distribuição de Gastos</h4>
              <div className="grid grid-cols-6 gap-2 h-4 rounded-lg overflow-hidden">
                <div 
                  className="bg-blue-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.hospedagem || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Hospedagem: ${Math.round(((selectedTravel.hospedagem || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-orange-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.alimentacao || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Alimentação: ${Math.round(((selectedTravel.alimentacao || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-purple-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.transporte || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Transporte: ${Math.round(((selectedTravel.transporte || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-yellow-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.academia || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Academia: ${Math.round(((selectedTravel.academia || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-green-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.suplementos || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Suplementos: ${Math.round(((selectedTravel.suplementos || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-red-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((selectedTravel.atividades || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 6))}`}}
                  title={`Atividades: ${Math.round(((selectedTravel.atividades || 0) / (selectedTravel.total || selectedTravel.distotal || 1)) * 100)}%`}
                ></div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="text-green-400" size={20} />
                Informações da Viagem
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">País:</span>
                  <span className="text-white font-medium">{selectedTravel.pais}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zona:</span>
                  <span className="text-white font-medium">{selectedTravel.zona}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Semana:</span>
                  <span className="text-white font-medium">{selectedTravel.semana}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bloco:</span>
                  <span className="text-white font-medium">{selectedTravel.bloco || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dias Schengen:</span>
                  <span className="text-white font-medium">{selectedTravel.dias_schengen || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avaliação:</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                    <span className="text-white font-medium">{selectedTravel.rating}/10</span>
                  </div>
                </div>
                {selectedTravel.notas && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Notas:</span>
                    <span className="text-white font-medium">{selectedTravel.notas}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="text-purple-400" size={20} />
                Custos Detalhados
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Subtotal:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.subtotal || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.total || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Buffer Base:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.buffer_base || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Buffer Alto:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.buffer_alto || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Base c/ Buffer:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.total_base_c_buffer || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Alto c/ Buffer:</span>
                    <div className="text-white font-medium">R$ {(selectedTravel.total_alto_c_buffer || 0).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="bg-gray-600 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Fator Extrapolado</p>
                    <p className="text-white font-bold text-xl">{selectedTravel.fator_extrapolado || (selectedTravel.zona === 'Schengen' ? '1.2' : '1.25')}x</p>
                    <p className="text-gray-400 text-xs">Multiplicador de custos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

                     {/* Botões de Ação */}
           <div className="flex gap-4 pt-4">
             <button 
               onClick={() => {
                 setEditingTravel(selectedTravel);
                 setShowEditTravelModal(true);
                 setShowTravelModal(false);
               }}
               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
             >
               <Edit size={20} />
               Editar Viagem
             </button>
             <button 
               onClick={() => setShowTravelModal(false)}
               className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
             >
               Fechar
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailModal;


