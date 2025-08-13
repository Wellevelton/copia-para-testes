import React, { useState } from 'react';
import { X, Save, Calendar, MapPin, DollarSign, Plane, Hotel, Utensils, Car, Dumbbell, Pill, Camera, Shield, Phone, FileText } from 'lucide-react';

const NewTravelModal = ({ isOpen, onClose, onSave }) => {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSubtotal = () => {
    return (
      formData.hospedagem_base +
      formData.alimentacao_base +
      formData.transporte_base +
      formData.academia_base +
      formData.suplementos_base +
      formData.atividades_base
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + formData.seguro_base + formData.telefone_base + formData.vistos_base + formData.voos_longos;
  };

  const handleSave = () => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const fator = formData.zona === 'Schengen' ? 1.2 : 1.25;

    const newTravel = {
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
      dias_schengen: formData.zona === 'Schengen' ? 7 : 0
    };

    onSave(newTravel);
    // Reset form
    setFormData({
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
  };

  if (!isOpen) return null;

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Plane className="text-blue-400" size={24} />
              Nova Viagem
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="text-purple-400" size={20} />
                Informações Básicas
              </h3>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Paris"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">País</label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: França"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Zona</label>
                <select
                  value={formData.zona}
                  onChange={(e) => handleInputChange('zona', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Schengen">Schengen</option>
                  <option value="Fora Schengen">Fora Schengen</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Bloco</label>
                <input
                  type="text"
                  value={formData.bloco}
                  onChange={(e) => handleInputChange('bloco', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Bloco1_Europa+Rússia"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="text-green-400" size={20} />
                Datas
              </h3>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Data de Início</label>
                <input
                  type="datetime-local"
                  value={formData.inicio}
                  onChange={(e) => handleInputChange('inicio', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Data de Fim</label>
                <input
                  type="datetime-local"
                  value={formData.fim}
                  onChange={(e) => handleInputChange('fim', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  rows="3"
                  placeholder="Observações sobre a viagem..."
                />
              </div>
            </div>
          </div>

          {/* Custos Base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="text-yellow-400" size={20} />
              Custos Base (por semana)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Hotel className="text-blue-400" size={16} />
                  Hospedagem
                </label>
                <input
                  type="number"
                  value={formData.hospedagem_base}
                  onChange={(e) => handleInputChange('hospedagem_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Utensils className="text-orange-400" size={16} />
                  Alimentação
                </label>
                <input
                  type="number"
                  value={formData.alimentacao_base}
                  onChange={(e) => handleInputChange('alimentacao_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Car className="text-green-400" size={16} />
                  Transporte
                </label>
                <input
                  type="number"
                  value={formData.transporte_base}
                  onChange={(e) => handleInputChange('transporte_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Dumbbell className="text-purple-400" size={16} />
                  Academia
                </label>
                <input
                  type="number"
                  value={formData.academia_base}
                  onChange={(e) => handleInputChange('academia_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Pill className="text-red-400" size={16} />
                  Suplementos
                </label>
                <input
                  type="number"
                  value={formData.suplementos_base}
                  onChange={(e) => handleInputChange('suplementos_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Camera className="text-pink-400" size={16} />
                  Atividades
                </label>
                <input
                  type="number"
                  value={formData.atividades_base}
                  onChange={(e) => handleInputChange('atividades_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Custos Adicionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="text-indigo-400" size={20} />
              Custos Adicionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="text-indigo-400" size={16} />
                  Seguro
                </label>
                <input
                  type="number"
                  value={formData.seguro_base}
                  onChange={(e) => handleInputChange('seguro_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="text-green-400" size={16} />
                  Telefone
                </label>
                <input
                  type="number"
                  value={formData.telefone_base}
                  onChange={(e) => handleInputChange('telefone_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <FileText className="text-yellow-400" size={16} />
                  Vistos
                </label>
                <input
                  type="number"
                  value={formData.vistos_base}
                  onChange={(e) => handleInputChange('vistos_base', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
                  <Plane className="text-blue-400" size={16} />
                  Voos Longos
                </label>
                <input
                  type="number"
                  value={formData.voos_longos}
                  onChange={(e) => handleInputChange('voos_longos', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resumo dos Custos */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Resumo dos Custos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Subtotal Base:</span>
                <div className="text-white font-medium">R$ {subtotal.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-400">Subtotal Alto:</span>
                <div className="text-white font-medium">R$ {Math.round(subtotal * (formData.zona === 'Schengen' ? 1.2 : 1.25)).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-400">Total Base:</span>
                <div className="text-white font-medium">R$ {total.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-400">Total Alto:</span>
                <div className="text-white font-medium">R$ {Math.round(total * (formData.zona === 'Schengen' ? 1.2 : 1.25)).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="p-6 border-t border-gray-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Salvar Viagem
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTravelModal;
