import React from 'react';
import { Plus, MoreVertical, Target } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ProjectsTab = ({ projects, setProjects, draggedItem, setDraggedItem, showAddModal, setShowAddModal, removeGoalAndProject, setActiveTab, setActiveSubTab }) => {

  // Drag and Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedProjects = projects.map(project =>
        project.id === draggedItem.id
          ? { ...project, status: newStatus }
          : project
      );
      setProjects(updatedProjects);
      setDraggedItem(null);
    }
  };

  const renderProjects = () => {
    const columns = {
      todo: projects.filter(p => p.status === 'todo'),
      progress: projects.filter(p => p.status === 'progress'),
      done: projects.filter(p => p.status === 'done')
    };

    const columnTitles = {
      todo: 'A Fazer',
      progress: 'Em Progresso', 
      done: 'Concluído'
    };

    const columnIcons = {
      todo: '📋',
      progress: '⚡',
      done: '✅'
    };

    return (
      <div className="space-y-6">
        {/* Header com botão Novo Projeto */}
                       <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-white">Projetos & Metas</h2>
                 <button 
                   onClick={() => {
                     setActiveTab('calendar');
                     setActiveSubTab('goals');
                     setShowAddModal(true);
                   }}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                 >
                   <Target size={16} />
                   Nova Meta
                 </button>
               </div>

        {/* Layout Trello com colunas ocupando todo o espaço */}
        <div className="grid grid-cols-3 gap-6 h-[600px]">
          {Object.entries(columns).map(([status, items]) => (
            <div 
              key={status}
              className="bg-gray-800 rounded-lg p-4 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{columnIcons[status]}</span>
                <h3 className="font-semibold text-white text-lg">{columnTitles[status]}</h3>
                <span className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300 ml-auto">
                  {items.length}
                </span>
              </div>
              
              {/* Scroll apenas nas colunas individuais */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {items.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    className={`p-4 rounded-lg cursor-move hover:bg-gray-600 transition-all shadow-sm hover:shadow-md ${
                      project.type === 'goal' ? 'bg-purple-700 border-l-4 border-l-yellow-400' : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white text-sm leading-5">
                        {project.type === 'goal' ? '🎯 ' : ''}{project.title}
                      </h4>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {project.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-gray-300">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Informações dos Goals para projetos do tipo meta */}
                    {project.type === 'goal' && project.goalId && (
                      <div className="bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg p-2 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-purple-400">🎯 Meta com Goals</span>
                          <span className="text-purple-300">
                            {project.progress}% concluído
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        project.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30' :
                        project.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30' :
                        'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30'
                      }`}>
                        {project.priority}
                      </span>
                      
                      <span className="text-gray-400">
                        {formatDate(project.dueDate)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.tags?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags?.length > 2 && (
                        <span className="text-gray-400 text-xs px-1">
                          +{project.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-600 rounded-lg">
                    <p className="text-sm">Arraste um projeto aqui</p>
                    <p className="text-xs text-gray-600 mt-1">ou clique para adicionar</p>
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
