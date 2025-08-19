import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Hotel, MapPin, Star, Edit, Save, Plane, Shield, Phone, FileText, TrendingUp, Info, Edit3 } from 'lucide-react';

const TravelDetailModal = ({ selectedTravel, setShowTravelModal, viagensData, setEditingTravel, setShowEditTravelModal, isRealizadoTab = false }) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(selectedTravel?.notas || '');

  if (!selectedTravel) return null;

  // Função para salvar notas
  const handleSaveNotes = () => {
    // Aqui você pode implementar a lógica para salvar as notas no backend
    console.log('Salvando notas:', notesText);
    setEditingNotes(false);
    // Atualizar o selectedTravel com as novas notas
    selectedTravel.notas = notesText;
  };

  // Função para formatar valores monetários corretamente
  const formatCurrency = (value) => {
    if (!value || value === 0) return 'R$ 0,00';
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Função para obter valores "realizados" (editados) ou padrão da planilha
  const getDisplayValue = (field, plannedValue) => {
    if (isRealizadoTab) {
      // Buscar valores específicos da aba "realizado" (campos com sufixo _realizado)
      const realizadoField = field + '_realizado';
      const realizadoValue = selectedTravel[realizadoField];
      
      // Se tem valor realizado editado, usar ele; senão R$ 0,00
      return realizadoValue || 0;
    }
    return plannedValue;
  };

  // Função para calcular duração em dias usando as datas da planilha
  const calculateDuration = () => {
    try {
      // Usar as datas corretas da planilha
      const start = new Date(selectedTravel.inicio || selectedTravel.Início);
      const end = new Date(selectedTravel.fim || selectedTravel.Fim);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return selectedTravel.dias_semana || 7;
      }
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    } catch (error) {
      return selectedTravel.dias_semana || 7;
    }
  };

  // Função para obter data formatada
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  // Função para corrigir nomes de países para exibição
  const formatCountryName = (country) => {
    if (!country) return 'N/A';
    
    const countryMappings = {
      'Alemanha': 'Alemanha',
      'Polonia': 'Polônia',
      'Russia': 'Rússia',
      'Suica': 'Suíça',
      'Italia': 'Itália',
      'Franca': 'França',
      'Portugal': 'Portugal',
      'Espanha': 'Espanha',
      'Holanda': 'Holanda',
      'Belgica': 'Bélgica',
      'Austria': 'Áustria',
      'Hungria': 'Hungria',
      'Republica Tcheca': 'República Tcheca',
      'Eslovaquia': 'Eslováquia',
      'Eslovenia': 'Eslovênia',
      'Croacia': 'Croácia',
      'Grecia': 'Grécia',
      'Turquia': 'Turquia',
      'Japao': 'Japão',
      'China': 'China',
      'Tailandia': 'Tailândia',
      'Singapura': 'Singapura',
      'Australia': 'Austrália',
      'Nova Zelandia': 'Nova Zelândia',
      'Emirados Arabes Unidos': 'Emirados Árabes Unidos',
      'Dubai': 'Dubai',
      'Abu Dhabi': 'Abu Dhabi',
      'Bangkok': 'Bangkok',
      'Chiang Mai': 'Chiang Mai',
      'Taipei': 'Taipei',
      'Sapporo': 'Sapporo',
      'Pequim': 'Pequim',
      'Xian': 'Xi\'an',
      'Pingyao': 'Pingyao',
      'Zhangjiajie': 'Zhangjiajie',
      'Guilin': 'Guilin',
      'Xangai': 'Xangai',
      'Sydney': 'Sydney',
      'Auckland': 'Auckland',
      'Istambul': 'Istambul',
      'Capadocia': 'Capadócia',
      'Antalya': 'Antalya',
      'Efeso': 'Éfeso',
      'Pamukkale': 'Pamukkale',
      'Zermatt': 'Zermatt',
      'Chamonix': 'Chamonix',
      'Interlaken': 'Interlaken',
      'Innsbruck': 'Innsbruck',
      'Roma': 'Roma',
      'Florenca': 'Florença',
      'Napoles': 'Nápoles',
      'Cinque Terre': 'Cinque Terre',
      'Matera': 'Matera',
      'Paris': 'Paris',
      'Porto': 'Porto',
      'Lisboa': 'Lisboa'
    };
    
    return countryMappings[country] || country;
  };

  const duration = calculateDuration();
  
  // Usar os campos corretos da planilha para os valores
  const totalCost = getDisplayValue('total', selectedTravel.total || selectedTravel.total_base || 0);
  const hospedagemCost = getDisplayValue('hospedagem', selectedTravel.hospedagem || 0);
  const alimentacaoCost = getDisplayValue('alimentacao', selectedTravel.alimentacao || 0);
  const transporteCost = getDisplayValue('transporte', selectedTravel.transporte || 0);
  const academiaCost = getDisplayValue('academia', selectedTravel.academia || 0);
  const suplementosCost = getDisplayValue('suplementos', selectedTravel.suplementos || 0);
  const atividadesCost = getDisplayValue('atividades', selectedTravel.atividades || 0);
  const seguroCost = getDisplayValue('seguro_base', selectedTravel.seguro_base || 0);
  const telefoneCost = getDisplayValue('telefone_base', selectedTravel.telefone_base || 0);
  const vistosCost = getDisplayValue('vistos_base', selectedTravel.vistos_base || 0);
  const voosCost = getDisplayValue('voos_longos', selectedTravel.voos_longos || 0);
  
  const dailyCost = duration > 0 ? totalCost / duration : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className={`${selectedTravel.zona === 'Schengen' ? 'bg-green-600' : 'bg-blue-600'} p-6 relative`}>
          <button 
            onClick={() => setShowTravelModal(false)} 
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedTravel.cidade || selectedTravel.Cidade || 'Destino'}</h2>
              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>
                    {formatDate(selectedTravel.inicio || selectedTravel.Início)} - {formatDate(selectedTravel.fim || selectedTravel.Fim)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{duration} dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{formatCountryName(selectedTravel.pais)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-300" size={20} fill="currentColor" />
                <span className="text-2xl font-bold">{selectedTravel.rating || 'N/A'}</span>
              </div>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {selectedTravel.zona || selectedTravel.Zona}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-6">
          {/* Resumo de Custos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Total da Viagem</h3>
                <DollarSign size={24} />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
              <p className="text-green-200 text-sm">Custo completo</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Hospedagem</h3>
                <Hotel size={24} />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(hospedagemCost)}</p>
              <p className="text-blue-200 text-sm">{Math.round(((hospedagemCost) / (totalCost || 1)) * 100)}% do total</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Por Dia</h3>
                <Calendar size={24} />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(dailyCost)}</p>
              <p className="text-purple-200 text-sm">Custo médio diário</p>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Semana</h3>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-2xl font-bold">{selectedTravel.semana || 'N/A'}</p>
              <p className="text-orange-200 text-sm">Período da viagem</p>
            </div>
          </div>

          {/* Detalhamento de Custos */}
          <div className="bg-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center gap-2">
              <DollarSign className="text-blue-400" size={24} />
              Detalhamento de Custos
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Hospedagem</span>
                  <Hotel className="text-blue-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(hospedagemCost)}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Alimentação</span>
                  <span className="text-orange-400">🍽️</span>
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(alimentacaoCost)}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Transporte</span>
                  <span className="text-purple-400">🚗</span>
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(transporteCost)}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Academia</span>
                  <span className="text-yellow-400">💪</span>
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(academiaCost)}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Suplementos</span>
                  <span className="text-green-400">💊</span>
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(suplementosCost)}</p>
              </div>
              
              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Atividades</span>
                  <MapPin className="text-red-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(atividadesCost)}</p>
              </div>

              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Seguro</span>
                  <Shield className="text-green-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(seguroCost)}</p>
              </div>

              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Telefone</span>
                  <Phone className="text-blue-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(telefoneCost)}</p>
              </div>

              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Vistos</span>
                  <FileText className="text-purple-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(vistosCost)}</p>
              </div>

              <div className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Voos</span>
                  <Plane className="text-cyan-400" size={16} />
                </div>
                <p className="text-white font-semibold text-lg">{formatCurrency(voosCost)}</p>
              </div>
            </div>

            {/* Gráfico de Pizza Visual */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Distribuição de Gastos</h4>
              <div className="grid grid-cols-6 gap-2 h-4 rounded-lg overflow-hidden">
                <div 
                  className="bg-blue-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((hospedagemCost) / (totalCost || 1)) * 6))}`}}
                  title={`Hospedagem: ${Math.round(((hospedagemCost) / (totalCost || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-orange-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((alimentacaoCost) / (totalCost || 1)) * 6))}`}}
                  title={`Alimentação: ${Math.round(((alimentacaoCost) / (totalCost || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-purple-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((transporteCost) / (totalCost || 1)) * 6))}`}}
                  title={`Transporte: ${Math.round(((transporteCost) / (totalCost || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-yellow-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((academiaCost) / (totalCost || 1)) * 6))}`}}
                  title={`Academia: ${Math.round(((academiaCost) / (totalCost || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-green-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((suplementosCost) / (totalCost || 1)) * 6))}`}}
                  title={`Suplementos: ${Math.round(((suplementosCost) / (totalCost || 1)) * 100)}%`}
                ></div>
                <div 
                  className="bg-red-500" 
                  style={{gridColumn: `span ${Math.max(1, Math.round(((atividadesCost) / (totalCost || 1)) * 6))}`}}
                  title={`Atividades: ${Math.round(((atividadesCost) / (totalCost || 1)) * 100)}%`}
                ></div>
              </div>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações da Viagem */}
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="text-green-400" size={20} />
                Informações da Viagem
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">País:</span>
                  <span className="text-white font-medium">{selectedTravel.pais || selectedTravel.País || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zona:</span>
                  <span className="text-white font-medium">{selectedTravel.zona || selectedTravel.Zona || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Semana:</span>
                  <span className="text-white font-medium">{selectedTravel.semana || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bloco:</span>
                  <span className="text-white font-medium">{selectedTravel.bloco || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dias:</span>
                  <span className="text-white font-medium">{selectedTravel.dias_semana || duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dias Schengen:</span>
                  <span className="text-white font-medium">{selectedTravel.dias_schengen || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avaliação:</span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                    <span className="text-white font-medium">{selectedTravel.rating || 'N/A'}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custos Detalhados - Apenas aba Planejado */}
            {!isRealizadoTab && (
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="text-purple-400" size={20} />
                Custos Detalhados
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal Alto:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.subtotal_alto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Base:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Alto:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.total_alto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fator Extrapolado:</span>
                    <span className="text-white font-medium">{selectedTravel.fator_extrapolado || '1.0'}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buffer Base:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.buffer_base)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buffer Alto:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.buffer_alto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total + Gastos Possíveis:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.total_base_c_buffer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total + Gastos + Extrapolado:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedTravel.total_alto_c_buffer)}</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Notas e Informações Adicionais */}
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Info className="text-blue-400" size={20} />
                Notas e Informações
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
                    Notas:
                    <button 
                      onClick={() => setEditingNotes(!editingNotes)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar notas"
                    >
                      <Edit3 size={16} />
                    </button>
                  </label>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full bg-gray-600 rounded-lg p-3 text-white border border-gray-500 focus:border-blue-400 focus:outline-none resize-none"
                        rows={4}
                        placeholder="Digite suas notas..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(false);
                            setNotesText(selectedTravel.notas || '');
                          }}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-600 rounded-lg p-3 text-white min-h-[80px]">
                      {selectedTravel.notas || 'Nenhuma nota disponível'}
                    </div>
                  )}
                </div>
                
                {/* Valores financeiros - Apenas aba Planejado */}
                {!isRealizadoTab && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Voos Longos:</span>
                    <span className="text-white text-sm">{formatCurrency(selectedTravel.voos_longos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Seguro Alto:</span>
                    <span className="text-white text-sm">{formatCurrency(selectedTravel.seguro_alto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Telefone Alto:</span>
                    <span className="text-white text-sm">{formatCurrency(selectedTravel.telefone_alto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Vistos Alto:</span>
                    <span className="text-white text-sm">{formatCurrency(selectedTravel.vistos_alto)}</span>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            {isRealizadoTab && (
              <button 
                onClick={() => {
                  setEditingTravel(selectedTravel);
                  setShowEditTravelModal(true);
                  setShowTravelModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={20} />
                Editar Gastos Reais
              </button>
            )}
            <button 
              onClick={() => setShowTravelModal(false)}
              className={`${isRealizadoTab ? 'bg-gray-600 hover:bg-gray-700 px-6' : 'flex-1 bg-gray-600 hover:bg-gray-700'} text-white py-3 rounded-lg font-medium transition-colors`}
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



