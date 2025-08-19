import React, { useState } from 'react';
import { X, Save, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

const NewTransactionModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  const categories = [
    'Renda',
    'Renda Extra',
    'Educação',
    'Viagem',
    'Moradia',
    'Alimentação',
    'Transporte',
    'Lazer',
    'Saúde',
    'Emergência',
    'Investimentos',
    'Outros'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description: formData.description,
      amount: formData.type === 'income' ? Math.abs(parseFloat(formData.amount)) : -Math.abs(parseFloat(formData.amount)),
      category: formData.category,
      date: formData.date,
      type: formData.type
    };

    onSave(newTransaction);
    
    // Reset form
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="text-green-400" size={24} />
              Nova Transação
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleInputChange('type', 'income')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Receita
              </button>
              <button
                onClick={() => handleInputChange('type', 'expense')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="text-blue-400" size={16} />
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Ex: Salário, Supermercado, etc."
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
              <DollarSign className="text-green-400" size={16} />
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="0,00"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
              <Tag className="text-purple-400" size={16} />
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="text-orange-400" size={16} />
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
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
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTransactionModal;
