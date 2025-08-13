import React, { useState } from 'react';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

const CareerTab = ({ careerPlanning, setCareerPlanning, editingCareer, setEditingCareer, finances, setFinances }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [newCourse, setNewCourse] = useState({ name: '', cost: '', status: 'Em Progresso' });
  const [newMilestone, setNewMilestone] = useState({ name: '', date: '', status: 'Planejado' });
  const [newCertification, setNewCertification] = useState({ name: '', deadline: '', cost: '', status: 'Planejada' });

  const handleEdit = () => {
    setEditingCareer(true);
  };

  const handleSave = () => {
    setEditingCareer(false);
  };

  const handleCancel = () => {
    setEditingCareer(false);
  };

  const handleInputChange = (field, value) => {
    setCareerPlanning(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...careerPlanning.skillsDetailed];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setCareerPlanning(prev => ({
      ...prev,
      skillsDetailed: updatedSkills
    }));
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.cost) {
      const courseData = {
        name: newCourse.name,
        cost: newCourse.cost,
        status: newCourse.status
      };

      const updatedCourses = [...(careerPlanning.courses || []), courseData];
      setCareerPlanning(prev => ({
        ...prev,
        courses: updatedCourses
      }));

      if (newCourse.cost && newCourse.cost !== 'R$ 0') {
        const costValue = parseFloat(newCourse.cost.replace('R$ ', '').replace(',', '.'));
        const newTransaction = {
          id: Date.now(),
          description: `Curso: ${newCourse.name}`,
          amount: -costValue,
          category: 'Educação',
          date: new Date().toISOString().split('T')[0],
          type: 'expense'
        };
        setFinances(prev => [...prev, newTransaction]);
      }

      setNewCourse({ name: '', cost: '', status: 'Em Progresso' });
      setEditingSection(null);
    }
  };

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.date) {
      const updatedMilestones = [...(careerPlanning.milestones || []), newMilestone];
      setCareerPlanning(prev => ({
        ...prev,
        milestones: updatedMilestones
      }));
      setNewMilestone({ name: '', date: '', status: 'Planejado' });
      setEditingSection(null);
    }
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.deadline) {
      const updatedCertifications = [...(careerPlanning.certificationsDetailed || []), newCertification];
      setCareerPlanning(prev => ({
        ...prev,
        certificationsDetailed: updatedCertifications
      }));
      setNewCertification({ name: '', deadline: '', cost: '', status: 'Planejada' });
      setEditingSection(null);
    }
  };

  const removeItem = (type, index) => {
    if (type === 'course') {
      const updatedCourses = careerPlanning.courses?.filter((_, i) => i !== index) || [];
      setCareerPlanning(prev => ({ ...prev, courses: updatedCourses }));
    } else if (type === 'milestone') {
      const updatedMilestones = careerPlanning.milestones?.filter((_, i) => i !== index) || [];
      setCareerPlanning(prev => ({ ...prev, milestones: updatedMilestones }));
    } else if (type === 'certification') {
      const updatedCertifications = careerPlanning.certificationsDetailed?.filter((_, i) => i !== index) || [];
      setCareerPlanning(prev => ({ ...prev, certificationsDetailed: updatedCertifications }));
    }
  };

  // Verificar se careerPlanning existe
  if (!careerPlanning) {
    return <div className="text-white">Carregando dados de carreira...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Planejamento de Carreira</h2>
        <div className="flex gap-2">
          {editingCareer ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                Salvar
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Jornada Profissional</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">ATUAL</div>
            {editingCareer ? (
              <input
                type="text"
                value={careerPlanning.currentRole || ''}
                onChange={(e) => handleInputChange('currentRole', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-center font-semibold"
              />
            ) : (
              <div className="text-white font-semibold">{careerPlanning.currentRole || 'Não definido'}</div>
            )}
            {editingCareer ? (
              <input
                type="text"
                value={careerPlanning.currentSalary || ''}
                onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-blue-400 text-sm text-center mt-1"
              />
            ) : (
              <div className="text-blue-400 text-sm">{careerPlanning.currentSalary || 'Não definido'}</div>
            )}
          </div>
          
          <div className="flex-1 mx-6">
            <div className="relative">
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative"
                  style={{ width: '57%' }}
                >
                  <div className="absolute right-0 top-0 w-4 h-4 bg-green-500 rounded-full transform translate-x-2 -translate-y-0.5"></div>
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-green-400">57% do caminho</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">META</div>
            {editingCareer ? (
              <input
                type="text"
                value={careerPlanning.targetRole || ''}
                onChange={(e) => handleInputChange('targetRole', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-center font-semibold"
              />
            ) : (
              <div className="text-white font-semibold">{careerPlanning.targetRole || 'Não definido'}</div>
            )}
            {editingCareer ? (
              <input
                type="text"
                value={careerPlanning.targetSalary || ''}
                onChange={(e) => handleInputChange('targetSalary', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-purple-400 text-sm text-center mt-1"
              />
            ) : (
              <div className="text-purple-400 text-sm">{careerPlanning.targetSalary || 'Não definido'}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Desenvolvimento de Competências</h3>
        
        <div className="space-y-4">
          {careerPlanning.skillsDetailed?.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {editingCareer ? (
                  <input
                    type="text"
                    value={skill.name || ''}
                    onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white font-medium min-w-[120px]"
                  />
                ) : (
                  <span className="text-white font-medium min-w-[120px]">{skill.name || 'Skill'}</span>
                )}
                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">{skill.category || 'Categoria'}</span>
                {skill.priority === 'high' && (
                  <span className="text-xs text-red-400 font-semibold">ALTA</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full relative"
                    style={{ width: `${((skill.current || 0) / 10) * 100}%` }}
                  >
                    <div className="absolute right-0 top-0 w-2 h-2 bg-green-500 rounded-full transform translate-x-1 -translate-y-0.5"></div>
                  </div>
                </div>
                {editingCareer ? (
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={skill.current || 0}
                    onChange={(e) => handleSkillChange(index, 'current', parseInt(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm w-16 text-center"
                  />
                ) : (
                  <span className="text-white text-sm min-w-[40px]">{skill.current || 0}/10</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Certificações</h3>
            {editingCareer && (
              <button
                onClick={() => setEditingSection('certification')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {careerPlanning.certificationsDetailed?.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">{cert.name || 'Certificação'}</div>
                  <div className="text-sm text-gray-400">{cert.deadline || 'Data'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-green-400 font-medium">{cert.cost || 'Custo'}</div>
                    <div className="text-sm text-gray-400">{cert.status || 'Status'}</div>
                  </div>
                  {editingCareer && (
                    <button
                      onClick={() => removeItem('certification', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editingSection === 'certification' && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome da certificação"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                />
                <input
                  type="date"
                  value={newCertification.deadline}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Custo (ex: R$ 300)"
                  value={newCertification.cost}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addCertification}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Cursos</h3>
            {editingCareer && (
              <button
                onClick={() => setEditingSection('course')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {careerPlanning.courses?.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  <div>
                    <div className="text-white font-medium">{course.name || 'Curso'}</div>
                    <div className="text-sm text-gray-400">{course.status || 'Status'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-green-400 font-medium">{course.cost || 'Custo'}</div>
                  {editingCareer && (
                    <button
                      onClick={() => removeItem('course', index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editingSection === 'course' && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome do curso"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Custo (ex: R$ 200.9)"
                  value={newCourse.cost}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                />
                <select
                  value={newCourse.status}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                >
                  <option value="Em Progresso">Em Progresso</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Planejado">Planejado</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addCourse}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Cronograma de Marcos</h3>
          {editingCareer && (
            <button
              onClick={() => setEditingSection('milestone')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {careerPlanning.milestones?.map((milestone, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded"></div>
                <div>
                  <div className="text-white font-medium">{milestone.milestone || milestone.name || 'Marco'}</div>
                  <div className="text-sm text-gray-400">{milestone.date || 'Data'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-400">{milestone.status || 'Status'}</div>
                {editingCareer && (
                  <button
                    onClick={() => removeItem('milestone', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {editingSection === 'milestone' && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do marco"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
              />
              <input
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={addMilestone}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerTab;
