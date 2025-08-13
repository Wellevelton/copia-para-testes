import React from 'react';
import { Plus, Import, Target, Clock, CheckCircle, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-gray-800 rounded-lg p-6">
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
                className={`p-2 min-h-[80px] border border-gray-700 rounded cursor-pointer transition-colors ${
                  day ? 'hover:bg-gray-700' : ''
                } ${isToday ? 'bg-blue-900 border-blue-600' : 'bg-gray-800'}`}
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

  const renderGoals = () => (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-white">Metas & Objetivos</h2>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => {
          // Verificar se é uma meta do novo sistema ou do sistema antigo
          const isNewGoal = goal.type === 'goal';
          const progressPercentage = isNewGoal ? goal.progress : (goal.current / goal.target) * 100;
          const isCompleted = isNewGoal ? goal.progress >= 100 : goal.current >= goal.target;
          
          return (
            <div key={goal.id} className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
              isNewGoal ? 'border-l-blue-500' : 'border-l-green-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {isNewGoal ? '🎯 ' : ''}{goal.title}
                  </h3>
                  <span className="text-gray-400 text-xs">{goal.category || 'Sem categoria'}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <Target className="text-blue-500" size={20} />
                )}
              </div>
              
              {goal.description && (
                <p className="text-gray-300 text-xs mb-3 line-clamp-2">{goal.description}</p>
              )}
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">
                    {isNewGoal ? `${goal.progress}%` : `${goal.current} / ${goal.target} ${goal.unit}`}
                  </span>
                  <span className="text-gray-400">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs mb-3">
                {isNewGoal ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Clock className="text-orange-500" size={14} />
                      <span className="text-gray-400">
                        {goal.estimatedHours}h estimadas
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {goal.dueDate ? formatDate(goal.dueDate) : 'Sem data'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <Clock className="text-icon-500" size={14} />
                      <span className="text-gray-400">Streak: {goal.streak}</span>
                    </div>
                    <span className="text-gray-400">
                      {formatDate(goal.deadline)}
                    </span>
                  </>
                )}
              </div>
              
              {goal.tags && goal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {goal.tags.map(tag => (
                    <span key={tag} className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Informações dos Goals (sistema novo) */}
              {isNewGoal && goal.goals && goal.goals.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-xs font-medium">Goals ({goal.goals.filter(g => g.done).length}/{goal.goals.length})</span>
                    <span className="text-blue-400 text-xs font-bold">{goal.progress}%</span>
                  </div>
                  <div className="space-y-1">
                    {goal.goals.slice(0, 3).map((subGoal, index) => (
                      <div key={subGoal.id} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${subGoal.done ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        <span className={`${subGoal.done ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                          {subGoal.title}
                        </span>
                      </div>
                    ))}
                    {goal.goals.length > 3 && (
                      <div className="text-gray-500 text-xs">
                        +{goal.goals.length - 3} goals restantes
                      </div>
                    )}
                  </div>
                </div>
              )}
              
                             {/* Botões de ação */}
               <div className="flex gap-1">
                 {isNewGoal ? (
                   <>
                                           {/* Botões dos Goals numerados */}
                      {goal.goals && goal.goals.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-center w-full">
                          {goal.goals.map((subGoal, index) => (
                            <button
                              key={subGoal.id}
                              onClick={() => updateGoalProgress(goal.id, subGoal.id)}
                              className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                                subGoal.done
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              title={`Goal ${index + 1}: ${subGoal.title} - ${subGoal.done ? 'Concluído' : 'Pendente'}`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                   </>
                 ) : (
                   <>
                     <button 
                       onClick={() => updateGoalProgress(goal.id, Math.min(goal.current + 1, goal.target))}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                     >
                       +1
                     </button>
                     <button 
                       onClick={() => updateGoalProgress(goal.id, Math.max(goal.current - 1, 0))}
                       className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                     >
                       -1
                     </button>
                   </>
                 )}
                 
                                   {/* Botões de editar e excluir */}
                  <button 
                    onClick={() => handleEditGoal(goal)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                    title="Editar meta"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                    title="Excluir meta"
                  >
                    <X size={12} />
                  </button>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['calendar', 'goals'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'calendar' ? '📅 Calendário' : '🎯 Metas'}
          </button>
        ))}
      </div>
      {activeSubTab === 'calendar' ? renderCalendar() : renderGoals()}
    </div>
  );
};

export default CalendarTab;

