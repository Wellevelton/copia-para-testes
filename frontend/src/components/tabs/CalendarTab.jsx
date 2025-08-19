import React from 'react';
import { Plus, Import, Target, Clock, CheckCircle, Edit, X, ChevronLeft, ChevronRight, TrendingUp, Check, ChevronUp } from 'lucide-react';
import { formatDate, getDaysInMonth } from '../../utils/formatters';

const CalendarTab = ({ 
  activeSubTab, 
  setActiveSubTab, 
  currentDate, 
  setCurrentDate, 
  calendarEvents, 
  goals, 
  setGoals, 
  setShowEventModal, 
  setSelectedDate, 
  getEventsForDate,
  syncGoalProgress,
  setShowNewGoalModal,
  setEditingGoal,
  removeGoalAndProject
}) => {
  // Estados para controlar sub-objetivos
  const [expandedGoals, setExpandedGoals] = React.useState({});
  const [newSubGoalInputs, setNewSubGoalInputs] = React.useState({});
  const [showAddSubGoal, setShowAddSubGoal] = React.useState({});
  const updateGoalProgress = (goalId, subGoalId) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        if (goal.type === 'goal' && goal.goals) {
          // Para metas do novo sistema, atualizar o progresso baseado nos goals
          const updatedSubGoals = goal.goals.map(g => 
            g.id === subGoalId ? { ...g, done: !g.done } : g
          );
          
          // Sincronizar com projetos se a função estiver disponível
          if (syncGoalProgress) {
            syncGoalProgress(goalId, updatedSubGoals);
          }
          
          return { 
            ...goal, 
            goals: updatedSubGoals,
            progress: Math.round((updatedSubGoals.filter(g => g.done).length / updatedSubGoals.length) * 100)
          };
        } else {
          // Para metas do sistema antigo
          return { ...goal, current: subGoalId };
        }
      }
      return goal;
    });
    setGoals(updatedGoals);
  };

  const handleEditGoal = (goal) => {
    if (setEditingGoal && setShowNewGoalModal) {
      setEditingGoal(goal);
      setShowNewGoalModal(true);
    }
  };

  const handleDeleteGoal = (goalId) => {
    if (confirm('Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.')) {
      if (removeGoalAndProject) {
        removeGoalAndProject(goalId);
      } else {
        setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
      }
    }
  };

  // Funções para controlar sub-objetivos
  const toggleExpanded = (goalId) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const toggleAddSubGoal = (goalId) => {
    setShowAddSubGoal(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
    if (!showAddSubGoal[goalId]) {
      setNewSubGoalInputs(prev => ({
        ...prev,
        [goalId]: ''
      }));
    }
  };

  const handleAddSubGoal = (goalId) => {
    const newSubGoalTitle = newSubGoalInputs[goalId]?.trim();
    if (!newSubGoalTitle) return;

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newSubGoal = {
          id: Date.now() + Math.random(), // ID temporário
          title: newSubGoalTitle,
          done: false
        };
        
        const updatedSubGoals = [...(goal.goals || []), newSubGoal];
        
        return {
          ...goal,
          goals: updatedSubGoals,
          progress: Math.round((updatedSubGoals.filter(g => g.done).length / updatedSubGoals.length) * 100)
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
    setNewSubGoalInputs(prev => ({
      ...prev,
      [goalId]: ''
    }));
    setShowAddSubGoal(prev => ({
      ...prev,
      [goalId]: false
    }));

    // Sincronizar com backend se necessário
    if (syncGoalProgress) {
      const goal = updatedGoals.find(g => g.id === goalId);
      if (goal) {
        syncGoalProgress(goalId, goal.goals);
      }
    }
  };

  const handleCancelAddSubGoal = (goalId) => {
    setShowAddSubGoal(prev => ({
      ...prev,
      [goalId]: false
    }));
    setNewSubGoalInputs(prev => ({
      ...prev,
      [goalId]: ''
    }));
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-4 md:p-6 border border-gray-700/30 auto-scroll" style={{maxHeight: 'calc(100vh - 220px)', paddingBottom: '2rem'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-gray-400 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const events = getEventsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border border-gray-700/50 rounded cursor-pointer transition-all duration-200 ${
                  day ? 'hover:bg-gray-700/50' : ''
                } ${isToday ? 'bg-blue-900/60 border-blue-600/50' : 'bg-gray-800/50'}`}
                onClick={() => {
                  if (day) {
                    setSelectedDate(day);
                    setShowEventModal(true);
                  }
                }}
              >
                {day && (
                  <>
                    <div className="text-white text-sm font-medium mb-1">
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-white text-xs p-1 rounded truncate ${
                            event.type === 'goal' 
                              ? 'bg-purple-600 border-l-4 border-l-yellow-400' 
                              : 'bg-blue-600'
                          }`}
                        >
                          {event.type === 'goal' ? '🎯 ' : ''}
                          {event.startTime ? `${event.startTime} ` : ''}{event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-gray-400 text-xs">
                          +{events.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

    const renderGoals = () => {
      if (!goals || goals.length === 0) {
        return (
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-gray-400 text-lg font-medium mb-2">Nenhuma meta encontrada</h3>
            <p className="text-gray-500 text-sm">Crie sua primeira meta para começar a organizar seus objetivos.</p>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Metas & Objetivos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              // Verificar se é uma meta do novo sistema ou do sistema antigo
              const isNewGoal = goal.type === 'goal';
              
              // Calcular progresso corretamente
              let progressPercentage = 0;
              if (isNewGoal && goal.goals && goal.goals.length > 0) {
                const completedGoals = goal.goals.filter(g => g.done).length;
                progressPercentage = Math.round((completedGoals / goal.goals.length) * 100);
              } else if (isNewGoal) {
                progressPercentage = goal.progress || 0;
              } else {
                progressPercentage = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
              }
              
              const isCompleted = progressPercentage >= 100;
              
              // Definir cor da categoria baseada no tipo
              const getCategoryColor = (category) => {
                switch(category?.toLowerCase()) {
                  case 'desenvolvimento': return 'bg-purple-500';
                  case 'saúde e fitness': return 'bg-green-500';
                  case 'setup': return 'bg-gray-500';
                  case 'design': return 'bg-pink-500';
                  case 'esporte': return 'bg-red-500';
                  case 'urgent': return 'bg-red-500';
                  case 'important': return 'bg-yellow-500';
                  default: return 'bg-blue-500';
                }
              };
              
              return (
                <div key={goal.id} className="bg-gray-800/60 backdrop-blur-md rounded-xl p-5 border border-gray-700/40 hover:border-gray-600/60 transition-all duration-300 group shadow-lg hover:shadow-xl">
                  {/* Header com categoria e ícone de target */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getCategoryColor(goal.category)}`}></div>
                      <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        {goal.category || 'Sem categoria'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="text-blue-400" size={18} />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditGoal(goal)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 leading-tight">
                    {goal.title || 'Meta sem título'}
                  </h3>
                  
                  {/* Descrição */}
                  {goal.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{goal.description}</p>
                  )}
                  
                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 font-medium">Progresso</span>
                      <span className="text-white font-bold">
                        {Math.min(progressPercentage, 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Data e Horas Estimadas */}
                  <div className="flex justify-between items-center text-xs mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="text-gray-400" size={14} />
                      <span className="text-gray-400 font-medium">
                        {goal.dueDate ? formatDate(goal.dueDate) : 'Sem data'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="text-gray-400" size={14} />
                      <span className="text-gray-400 font-medium">
                        {goal.estimatedHours || 0}h estimadas
                      </span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {goal.tags && goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {goal.tags.map(tag => (
                        <span key={tag} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Informações dos Goals (sistema novo) */}
                  {isNewGoal && goal.goals && goal.goals.length > 0 && (
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-4 border border-gray-600/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300 text-xs font-semibold">Goals ({goal.goals.filter(g => g.done).length}/{goal.goals.length})</span>
                        <span className="text-blue-400 text-xs font-bold">{goal.progress}%</span>
                      </div>
                      <div className="space-y-1.5">
                        {goal.goals.slice(0, 3).map((subGoal, index) => (
                          <div key={subGoal.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${subGoal.done ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            <span className={`${subGoal.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                              {subGoal.title}
                            </span>
                          </div>
                        ))}
                        {goal.goals.length > 3 && (
                          <div className="text-gray-500 text-xs font-medium">
                            +{goal.goals.length - 3} goals restantes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Sub-objetivos com design moderno */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-medium">
                        Subobjetivos ({goal.goals ? goal.goals.filter(g => g.done).length : 0}/{goal.goals ? goal.goals.length : 0})
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleAddSubGoal(goal.id)}
                          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => toggleExpanded(goal.id)}
                          className={`text-gray-400 hover:text-white p-1 rounded transition-colors ${
                            expandedGoals[goal.id] ? 'rotate-180' : ''
                          }`}
                        >
                          <ChevronUp size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Campo de adicionar novo sub-objetivo */}
                    {showAddSubGoal[goal.id] && (
                      <div className="mb-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                        <input
                          type="text"
                          placeholder="Nome do subobjetivo..."
                          value={newSubGoalInputs[goal.id] || ''}
                          onChange={(e) => setNewSubGoalInputs(prev => ({
                            ...prev,
                            [goal.id]: e.target.value
                          }))}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubGoal(goal.id)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAddSubGoal(goal.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Adicionar
                          </button>
                          <button
                            onClick={() => handleCancelAddSubGoal(goal.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de sub-objetivos */}
                    {goal.goals && goal.goals.length > 0 && expandedGoals[goal.id] !== false && (
                      <div className="space-y-2">
                        {goal.goals.map((subGoal, index) => (
                          <div 
                            key={subGoal.id} 
                            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-all duration-200 cursor-pointer"
                            onClick={() => updateGoalProgress(goal.id, subGoal.id)}
                          >
                            {/* Checkbox moderno */}
                            <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                              subGoal.done
                                ? 'bg-green-500 border-green-500 shadow-lg'
                                : 'bg-transparent border-gray-400 group-hover:border-green-400'
                            }`}>
                              {subGoal.done && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            
                            {/* Texto do sub-objetivo */}
                            <span className={`text-sm flex-1 transition-all duration-200 ${
                              subGoal.done 
                                ? 'text-gray-400 line-through' 
                                : 'text-white'
                            }`}>
                              {subGoal.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Sistema antigo removido - apenas design moderno */}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

  return (
    <div className="space-y-6">
      {renderCalendar()}
    </div>
  );
};

export default CalendarTab;

