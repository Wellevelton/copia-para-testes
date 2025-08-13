import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, DollarSign, Plane, Hotel, Utensils, Car, Dumbbell, Pill, Camera, Shield, Phone, FileText } from 'lucide-react';

const EditTravelModal = ({ isOpen, onClose, onSave, travelData }) => {
  const [formData, setFormData] = useState({
    cidade: '',
    pais: '',
    zona: 'Schengen',
    inicio: '',
    fim: '',
    hospedagem_base: 0,
    alimentacao_base: 0,
    transporte_base: 0,
    academia_base: 0,
    suplementos_base: 0,
    atividades_base: 0,
    seguro_base: 62,
    telefone_base: 20,
    vistos_base: 25,
    voos_longos: 0,
    notas: '',
    bloco: '',
    rating: 8.0
  });

  useEffect(() => {
    if (travelData) {
      setFormData({
        cidade: travelData.cidade || '',
        pais: travelData.pais || '',
        zona: travelData.zona || 'Schengen',
        inicio: travelData.inicio ? travelData.inicio.split(' ')[0] : '',
        fim: travelData.fim ? travelData.fim.split(' ')[0] : '',
        hospedagem_base: travelData.hospedagem_base || 0,
        alimentacao_base: travelData.alimentacao_base || 0,
        transporte_base: travelData.transporte_base || 0,
        academia_base: travelData.academia_base || 0,
        suplementos_base: travelData.suplementos_base || 0,
        atividades_base: travelData.atividades_base || 0,
        seguro_base: travelData.seguro_base || 62,
        telefone_base: travelData.telefone_base || 20,
        vistos_base: travelData.vistos_base || 25,
        voos_longos: travelData.voos_longos || 0,
        notas: travelData.notas || '',
        bloco: travelData.bloco || '',
        rating: travelData.rating || 8.0
      });
    }
  }, [travelData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSubtotal = () => {
    return formData.hospedagem_base + formData.alimentacao_base + formData.transporte_base + 
           formData.academia_base + formData.suplementos_base + formData.atividades_base;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const extras = formData.seguro_base + formData.telefone_base + formData.vistos_base + formData.voos_longos;
    return subtotal + extras;
  };

  const handleSave = () => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const fator = formData.zona === 'Schengen' ? 1.2 : 1.25;
    
    const updatedTravel = {
      ...travelData,
      ...formData,
      subtotal_base: subtotal,
      subtotal_alto: Math.round(subtotal * fator),
      fator_extrapolado: fator,
      total_base: total,
      total_alto: Math.round(total * fator),
      buffer_base: Math.round(total * 0.08),
      buffer_alto: Math.round(total * fator * 0.08),
      total_base_c_buffer: Math.round(total * 1.08),
      total_alto_c_buffer: Math.round(total * fator * 1.08),
      dias_semana: 7,
      dias_schengen: formData.zona === 'Schengen' ? 7 : 0,
      distotal: subtotal,
      longdist: Math.round(subtotal * fator),
      hospedagem: formData.hospedagem_base,
      tentacao: formData.alimentacao_base,
      importe: formData.transporte_base,
      bagemia: formData.academia_base,
      bimentos: formData.suplementos_base,
      cidades: formData.atividades_base,
      notes: formData.seguro_base
    };

    onSave(updatedTravel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <Plane className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Editar Viagem</h2>
              <p className="text-gray-400">Atualize os detalhes da viagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
            
            <div>
              <label className="block text-white font-medium mb-2">Cidade *</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Paris"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">País *</label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: França"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Zona</label>
              <select
                value={formData.zona}
                onChange={(e) => handleInputChange('zona', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Schengen">Schengen</option>
                <option value="Fora Schengen">Fora Schengen</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Data Início *</label>
                <input
                  type="date"
                  value={formData.inicio}
                  onChange={(e) => handleInputChange('inicio', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Data Fim *</label>
                <input
                  type="date"
                  value={formData.fim}
                  onChange={(e) => handleInputChange('fim', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Bloco</label>
              <input
                type="text"
                value={formData.bloco}
                onChange={(e) => handleInputChange('bloco', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Bloco1_Europa+Rússia"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Observações sobre a viagem..."
              />
            </div>
          </div>

          {/* Custos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Custos (R$)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Hotel size={16} />
                  Hospedagem
                </label>
                <input
                  type="number"
                  value={formData.hospedagem_base}
                  onChange={(e) => handleInputChange('hospedagem_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Utensils size={16} />
                  Alimentação
                </label>
                <input
                  type="number"
                  value={formData.alimentacao_base}
                  onChange={(e) => handleInputChange('alimentacao_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Car size={16} />
                  Transporte
                </label>
                <input
                  type="number"
                  value={formData.transporte_base}
                  onChange={(e) => handleInputChange('transporte_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Dumbbell size={16} />
                  Academia
                </label>
                <input
                  type="number"
                  value={formData.academia_base}
                  onChange={(e) => handleInputChange('academia_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Pill size={16} />
                  Suplementos
                </label>
                <input
                  type="number"
                  value={formData.suplementos_base}
                  onChange={(e) => handleInputChange('suplementos_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Atividades
                </label>
                <input
                  type="number"
                  value={formData.atividades_base}
                  onChange={(e) => handleInputChange('atividades_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  Seguro
                </label>
                <input
                  type="number"
                  value={formData.seguro_base}
                  onChange={(e) => handleInputChange('seguro_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Telefone
                </label>
                <input
                  type="number"
                  value={formData.telefone_base}
                  onChange={(e) => handleInputChange('telefone_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Vistos
                </label>
                <input
                  type="number"
                  value={formData.vistos_base}
                  onChange={(e) => handleInputChange('vistos_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Plane size={16} />
                  Voos Longos
                </label>
                <input
                  type="number"
                  value={formData.voos_longos}
                  onChange={(e) => handleInputChange('voos_longos', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Resumo dos Custos */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-white font-semibold mb-3">Resumo dos Custos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Subtotal Base:</span>
              <div className="text-white font-medium">R$ {calculateSubtotal().toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-400">Total Base:</span>
              <div className="text-white font-medium">R$ {calculateTotal().toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-400">Subtotal Alto:</span>
              <div className="text-white font-medium">R$ {Math.round(calculateSubtotal() * (formData.zona === 'Schengen' ? 1.2 : 1.25)).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-400">Total Alto:</span>
              <div className="text-white font-medium">R$ {Math.round(calculateTotal() * (formData.zona === 'Schengen' ? 1.2 : 1.25)).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Salvar Alterações
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTravelModal;
