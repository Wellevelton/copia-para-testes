import React, { useState } from 'react';
import { Plus, MoreVertical, Target, Clock, TrendingUp, Edit, X, Check, ChevronUp } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import apiService from '../../services/api';

const ProjectsTab = ({ projects, setProjects, draggedItem, setDraggedItem, showAddModal, setShowAddModal, removeGoalAndProject, setActiveTab, setActiveSubTab, goals, setGoals, syncGoalProgress, setEditingGoal }) => {

  // Estados para gerenciar metas
  const [expandedGoals, setExpandedGoals] = useState({});
  const [newSubGoalInputs, setNewSubGoalInputs] = useState({});
  const [showAddSubGoal, setShowAddSubGoal] = useState({});

  // Função para processar sub-objetivos (parsear JSON strings)
  const processSubGoals = (project) => {
    if (!project.goals) return [];
    
    // Se goals é um array de strings (JSON), parsear cada uma
    if (Array.isArray(project.goals)) {
      return project.goals.map(goal => {
        if (typeof goal === 'string') {
          try {
            return JSON.parse(goal);
          } catch (e) {
            return { id: Date.now(), title: goal, done: false };
          }
        }
        return goal;
      });
    }
    
    return [];
  };

  // Função para obter cor da prioridade
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'alta': return 'bg-red-500';
      case 'high': return 'bg-red-500';
      case 'média': return 'bg-yellow-500';
      case 'medium': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  // Função para obter texto da prioridade
  const getPriorityText = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'alta': return 'Alta';
      case 'high': return 'Alta';
      case 'média': return 'Média';
      case 'medium': return 'Média';
      case 'baixa': return 'Baixa';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  // Funções para gerenciar metas
  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowAddModal(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      await removeGoalAndProject(goalId);
    }
  };

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

  const handleAddSubGoal = async (goalId) => {
    const inputValue = newSubGoalInputs[goalId]?.trim();
    if (!inputValue) return;

    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newSubGoal = {
          id: Date.now().toString(),
          title: inputValue,
          done: false
        };
        return {
          ...goal,
          goals: [...(goal.goals || []), newSubGoal]
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

    // Sincronizar com backend
    if (syncGoalProgress) {
      const goal = updatedGoals.find(g => g.id === goalId);
      if (goal) {
        await syncGoalProgress(goalId, goal);
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

  const updateGoalProgress = async (goalId, subGoalId) => {
    const updatedGoals = projects.map(goal => {
      if (goal.id === goalId) {
        // Processar sub-objetivos existentes
        const currentSubGoals = processSubGoals(goal);
        const updatedSubGoals = currentSubGoals.map(subGoal => {
          if (subGoal.id === subGoalId) {
            return { ...subGoal, done: !subGoal.done };
          }
          return subGoal;
        });
        
        const completedCount = updatedSubGoals.filter(sg => sg.done).length;
        const progress = Math.round((completedCount / updatedSubGoals.length) * 100);
        
        // Converter de volta para JSON strings para salvar no backend
        const goalsAsStrings = updatedSubGoals.map(subGoal => JSON.stringify(subGoal));
        
        return {
          ...goal,
          goals: goalsAsStrings,
          progress: progress
        };
      }
      return goal;
    });

    setProjects(updatedGoals);

    // Sincronizar com backend
    if (syncGoalProgress) {
      const goal = updatedGoals.find(g => g.id === goalId);
      if (goal) {
        await syncGoalProgress(goalId, goal);
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedItem) {
      try {
        // Atualizar no backend usando apiService (goals, não projects)
        const response = await apiService.goals.update(draggedItem.id, { status: newStatus });
        
        // Se sucesso no backend, atualizar localmente
        const updatedProjects = projects.map(project =>
          project.id === draggedItem.id
            ? { ...project, status: newStatus }
            : project
        );
        setProjects(updatedProjects);
        setDraggedItem(null);
        
        console.log('✅ Status da meta atualizado no backend');
      } catch (error) {
        console.error('❌ Erro ao atualizar status da meta:', error);
        // Reverter mudança local se falhar no backend
        alert('Erro ao salvar mudança. Tente novamente.');
      }
    }
  };

  const renderProjects = () => {
    const columns = {
      todo: projects.filter(p => p.status === 'pending' || p.status === 'todo'),
      progress: projects.filter(p => p.status === 'in_progress' || p.status === 'progress'),
      done: projects.filter(p => p.status === 'completed' || p.status === 'done')
    };

    const columnTitles = {
      todo: 'Para Fazer',
      progress: 'Em Progresso', 
      done: 'Concluído'
    };

    const columnIcons = {
      todo: '📋',
      progress: '⚡',
      done: '✅'
    };

    return (
      <div className="space-y-6 auto-scroll" style={{maxHeight: 'calc(100vh - 180px)', paddingBottom: '1.5rem'}}>
        {/* Header com título e avatars */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Board de Metas</h2>
            <p className="text-gray-400 text-sm mt-1">Organize suas metas e acompanhe o progresso</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            >
              <Target size={16} />
              Nova Meta
            </button>
          </div>
        </div>

        {/* Layout Trello com colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[500px]">
          {Object.entries(columns).map(([status, items]) => (
            <div 
              key={status}
              className="bg-gray-800/60 backdrop-blur-md rounded-xl p-4 flex flex-col border border-gray-700/40"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Header da coluna */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-lg">{columnTitles[status]}</h3>
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {items.length}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-white p-1 rounded">
                  <Plus size={16} />
                </button>
              </div>
              
              {/* Cards da coluna */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {items.map((project) => {
                  // Calcular progresso
                  let progressPercentage = project.progress || 0;
                  
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
                    <div
                      key={project.id}
                      draggable
                      className="bg-gray-800/60 backdrop-blur-md rounded-xl p-5 border border-gray-700/40 hover:border-gray-600/60 transition-all duration-300 group shadow-lg hover:shadow-xl cursor-move"
                      onDragStart={(e) => handleDragStart(e, project)}
                    >
                      {/* Header com categoria, prioridade e ícone de target */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${getCategoryColor(project.category)}`}></div>
                          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            {project.category || 'Sem categoria'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Badge de prioridade */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(project.priority)}`}>
                            {getPriorityText(project.priority)}
                          </div>
                          <Target className="text-blue-400" size={18} />
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditGoal(project)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteGoal(project.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Título */}
                      <h4 className="text-white font-bold text-lg mb-3 line-clamp-2 leading-tight">
                        {project.title || 'Meta sem título'}
                      </h4>
                      
                      {/* Descrição */}
                      {project.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{project.description}</p>
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
                            className={`h-2.5 rounded-full transition-all duration-300 ${progressPercentage >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'}`}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Data e Horas Estimadas */}
                      <div className="flex justify-between items-center text-xs mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="text-gray-400" size={14} />
                          <span className="text-gray-400 font-medium">
                            {project.dueDate ? formatDate(project.dueDate) : 'Sem data'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="text-gray-400" size={14} />
                          <span className="text-gray-400 font-medium">
                            {project.estimatedHours || 0}h estimadas
                          </span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.tags.map(tag => (
                            <span key={tag} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      

                      
                      {/* Sub-objetivos com design moderno */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white text-sm font-medium">
                            Subobjetivos ({processSubGoals(project).filter(g => g.done).length}/{processSubGoals(project).length})
                          </span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toggleAddSubGoal(project.id)}
                              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                              onClick={() => toggleExpanded(project.id)}
                              className={`text-gray-400 hover:text-white p-1 rounded transition-colors ${
                                expandedGoals[project.id] ? 'rotate-180' : ''
                              }`}
                            >
                              <ChevronUp size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Campo de adicionar novo sub-objetivo */}
                        {showAddSubGoal[project.id] && (
                          <div className="mb-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                            <input
                              type="text"
                              placeholder="Nome do subobjetivo..."
                              value={newSubGoalInputs[project.id] || ''}
                              onChange={(e) => setNewSubGoalInputs(prev => ({
                                ...prev,
                                [project.id]: e.target.value
                              }))}
                              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddSubGoal(project.id)}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAddSubGoal(project.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Adicionar
                              </button>
                              <button
                                onClick={() => handleCancelAddSubGoal(project.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Lista de sub-objetivos */}
                        {processSubGoals(project).length > 0 && expandedGoals[project.id] !== false && (
                          <div className="space-y-2">
                            {processSubGoals(project).map((subGoal, index) => (
                              <div 
                                key={subGoal.id} 
                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-all duration-200 cursor-pointer"
                                onClick={() => updateGoalProgress(project.id, subGoal.id)}
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
                    </div>
                  );
                })}
                
                {items.length === 0 && (
                  <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-600/50 rounded-lg bg-gray-800/20 backdrop-blur-sm">
                    <p className="text-sm">Arraste um projeto aqui</p>
                    <p className="text-xs text-gray-500 mt-1">ou clique para adicionar</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return renderProjects();
};

export default ProjectsTab;
