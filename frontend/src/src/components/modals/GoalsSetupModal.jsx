import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Edit3, CheckCircle, Circle } from 'lucide-react';

const GoalsSetupModal = ({ isOpen, onClose, onSaveGoals, metaData, totalGoals }) => {
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  useEffect(() => {
    if (isOpen && totalGoals > 0) {
      // Inicializar goals vazios
      const initialGoals = Array.from({ length: totalGoals }, (_, index) => ({
        id: `temp-${index}`,
        title: '',
        note: '',
        done: false,
        order: index + 1
      }));
      setGoals(initialGoals);
    }
  }, [isOpen, totalGoals]);

  const handleSaveGoal = (goalId) => {
    if (!newGoalTitle.trim()) return;

    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, title: newGoalTitle.trim() }
        : goal
    ));
    setNewGoalTitle('');
    setEditingGoal(null);
  };

  const handleGoalToggle = (goalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, done: !goal.done }
        : goal
    ));
  };

  const handleSaveAllGoals = () => {
    const validGoals = goals.filter(goal => goal.title.trim());
    if (validGoals.length !== totalGoals) {
      alert(`Por favor, preencha todos os ${totalGoals} goals antes de continuar.`);
      return;
    }

    const finalGoals = validGoals.map((goal, index) => ({
      ...goal,
      id: Date.now() + index,
      title: goal.title.trim()
    }));

    onSaveGoals(finalGoals);
    onClose();
  };

  const getProgressPercentage = () => {
    const completedGoals = goals.filter(goal => goal.done).length;
    return Math.round((completedGoals / totalGoals) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">Configurar Goals da Meta</h3>
              <p className="text-gray-400 text-sm">
                {metaData?.title} - {totalGoals} sub-objetivos para completar
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

        {/* Progresso */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progresso dos Goals</span>
            <span className="text-blue-400 font-bold">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{goals.filter(g => g.done).length} de {totalGoals} goals concluídos</span>
            <span>Cada goal = {Math.round(100 / totalGoals)}% do progresso total</span>
          </div>
        </div>

        {/* Lista de Goals */}
        <div className="space-y-4 mb-6">
          <h4 className="text-white font-semibold text-lg">Goals da Meta</h4>
          
          {goals.map((goal, index) => (
            <div key={goal.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleGoalToggle(goal.id)}
                  className="flex-shrink-0"
                >
                  {goal.done ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-gray-400 hover:text-blue-400" />
                  )}
                </button>

                {/* Número do Goal */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {goal.order}
                </div>

                {/* Conteúdo do Goal */}
                <div className="flex-1">
                  {editingGoal === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Título do goal..."
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveGoal(goal.id)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingGoal(null);
                          setNewGoalTitle('');
                        }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className={`font-medium ${goal.title ? 'text-white' : 'text-gray-500 italic'}`}>
                          {goal.title || `Goal ${goal.order} - Clique para editar`}
                        </h5>
                        {goal.note && (
                          <p className="text-gray-400 text-sm mt-1">{goal.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingGoal(goal.id);
                          setNewGoalTitle(goal.title);
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.done 
                      ? 'bg-green-600 text-white' 
                      : goal.title 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {goal.done ? 'Concluído' : goal.title ? 'Pendente' : 'Vazio'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instruções */}
        <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4 mb-6">
          <h5 className="text-blue-400 font-medium mb-2">📋 Como funciona:</h5>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Cada goal representa {Math.round(100 / totalGoals)}% do progresso da meta</li>
            <li>• Preencha o título de todos os goals antes de continuar</li>
            <li>• Marque os goals como concluídos conforme for progredindo</li>
            <li>• O progresso é calculado automaticamente</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSaveAllGoals}
            disabled={goals.filter(g => g.title.trim()).length !== totalGoals}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Target size={18} />
            Salvar Goals e Finalizar Meta
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsSetupModal;

