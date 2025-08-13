import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, Edit3, Tag, AlertTriangle } from 'lucide-react';

const NewGoalModal = ({ isOpen, onClose, onSaveGoal, editingGoal }) => {
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    dueDate: '',
    category: '',
    priority: 'medium',
    estimatedHours: 0,
    totalGoals: 1,
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  // Carregar dados para edição
  useEffect(() => {
    if (editingGoal) {
      setGoalData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        dueDate: editingGoal.dueDate || '',
        category: editingGoal.category || '',
        priority: editingGoal.priority || 'medium',
        estimatedHours: editingGoal.estimatedHours || 0,
        totalGoals: editingGoal.totalGoals || 1,
        tags: editingGoal.tags || []
      });
    } else {
      // Reset para criação
      setGoalData({
        title: '',
        description: '',
        dueDate: '',
        category: '',
        priority: 'medium',
        estimatedHours: 0,
        totalGoals: 1,
        tags: []
      });
    }
  }, [editingGoal]);

  const categories = [
    'Estudos', 'Trabalho', 'Pessoal', 'Saúde', 'Finanças', 
    'Carreira', 'Viagens', 'Hobbies', 'Família', 'Outros'
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'text-green-400' },
    { value: 'medium', label: 'Média', color: 'text-yellow-400' },
    { value: 'high', label: 'Alta', color: 'text-red-400' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalData.title || !goalData.dueDate) {
      alert('Título e data são obrigatórios!');
      return;
    }
    
    const goal = {
      id: Date.now(),
      ...goalData,
      status: 'todo',
      progress: 0,
      actualHours: 0,
      createdAt: new Date().toISOString(),
      type: 'goal'
    };

    onSaveGoal(goal);
    onClose();
    setGoalData({
      title: '',
      description: '',
      dueDate: '',
      category: '',
      priority: 'medium',
      estimatedHours: 0,
      totalGoals: 1,
      tags: []
    });
  };

  const addTag = () => {
    if (newTag.trim() && !goalData.tags.includes(newTag.trim())) {
      setGoalData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setGoalData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
                         <div>
               <h3 className="text-white text-xl font-bold">
                 {editingGoal ? 'Editar Meta' : 'Nova Meta'}
               </h3>
               <p className="text-gray-400 text-sm">
                 {editingGoal ? 'Edite os dados da sua meta' : 'Crie uma nova meta que será integrada aos projetos'}
               </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-white font-medium mb-2">
              Título da Meta *
            </label>
            <input
              type="text"
              value={goalData.title}
              onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Aprender React avançado"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-white font-medium mb-2">
              Descrição
            </label>
            <textarea
              value={goalData.description}
              onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva sua meta em detalhes..."
            />
          </div>

          {/* Data e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Data Limite *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={goalData.dueDate}
                  onChange={(e) => setGoalData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Categoria
              </label>
              <select
                value={goalData.category}
                onChange={(e) => setGoalData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioridade e Horas Estimadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Prioridade
              </label>
              <div className="flex gap-2">
                {priorities.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setGoalData(prev => ({ ...prev, priority: priority.value }))}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      goalData.priority === priority.value
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <AlertTriangle size={16} className="inline mr-2" />
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Horas Estimadas
              </label>
              <input
                type="number"
                min="0"
                value={goalData.estimatedHours}
                onChange={(e) => setGoalData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quantidade de Goals */}
          <div>
            <label className="block text-white font-medium mb-2">
              Quantidade de Goals (Sub-objetivos) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="20"
                value={goalData.totalGoals}
                onChange={(e) => setGoalData(prev => ({ ...prev, totalGoals: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                required
              />
              <div className="text-gray-400 text-sm">
                Cada goal = {Math.round(100 / goalData.totalGoals)}% do progresso
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Defina quantos sub-objetivos (goals) sua meta terá. Cada goal concluído representa uma parte do progresso total.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-medium mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adicionar tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
            
            {goalData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {goalData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <Tag size={14} />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
                         <button
               type="submit"
               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
             >
               <Target size={18} />
               {editingGoal ? 'Atualizar Meta' : 'Criar Meta'}
             </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGoalModal;
