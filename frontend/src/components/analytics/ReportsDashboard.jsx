import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import apiService from '../../services/api';

const ReportsDashboard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    finances: [],
    projects: [],
    goals: [],
    productivity: []
  });

  // Dados mock para demonstração
  const mockData = {
    finances: [
      { month: 'Jan', income: 5000, expenses: 3000, savings: 2000 },
      { month: 'Fev', income: 5500, expenses: 3200, savings: 2300 },
      { month: 'Mar', income: 4800, expenses: 2800, savings: 2000 },
      { month: 'Abr', income: 6000, expenses: 3500, savings: 2500 },
      { month: 'Mai', income: 5200, expenses: 3100, savings: 2100 },
      { month: 'Jun', income: 5800, expenses: 3300, savings: 2500 }
    ],
    projects: [
      { name: 'Projeto A', progress: 75, deadline: '2024-03-15' },
      { name: 'Projeto B', progress: 45, deadline: '2024-04-20' },
      { name: 'Projeto C', progress: 90, deadline: '2024-02-28' },
      { name: 'Projeto D', progress: 30, deadline: '2024-05-10' }
    ],
    goals: [
      { name: 'Meta Financeira', completed: 70, total: 100 },
      { name: 'Meta de Carreira', completed: 85, total: 100 },
      { name: 'Meta de Saúde', completed: 60, total: 100 },
      { name: 'Meta de Viagem', completed: 40, total: 100 }
    ],
    productivity: [
      { day: 'Seg', tasks: 8, completed: 6 },
      { day: 'Ter', tasks: 10, completed: 8 },
      { day: 'Qua', tasks: 7, completed: 7 },
      { day: 'Qui', tasks: 9, completed: 7 },
      { day: 'Sex', tasks: 6, completed: 5 },
      { day: 'Sab', tasks: 4, completed: 3 },
      { day: 'Dom', tasks: 2, completed: 2 }
    ]
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar dados reais do backend
        const [projectsData, goalsData, financesData] = await Promise.all([
          apiService.projects.getAll().catch(() => ({ data: [] })),
          apiService.goals.getAll().catch(() => ({ data: [] })),
          apiService.finances.getAll().catch(() => ({ data: [] }))
        ]);

        // Processar dados para o formato dos gráficos
        const processedData = {
          finances: financesData.data?.map(item => ({
            month: item.date?.split('-')[1] || 'Jan',
            income: item.amount > 0 ? item.amount : 0,
            expenses: item.amount < 0 ? Math.abs(item.amount) : 0,
            savings: 0
          })) || mockData.finances,
          projects: projectsData.data?.map(item => ({
            name: item.title,
            progress: item.progress || 0,
            deadline: item.dueDate
          })) || mockData.projects,
          goals: goalsData.data?.map(item => ({
            name: item.title,
            completed: item.progress || 0,
            total: 100
          })) || mockData.goals,
          productivity: mockData.productivity // Manter dados mock para produtividade
        };

        setData(processedData);
      } catch (error) {
        console.error('Erro ao carregar dados dos relatórios:', error);
        setData(mockData); // Fallback para dados mock
      }
    };

    loadData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'finances', label: 'Finanças', icon: '💰' },
    { id: 'projects', label: 'Projetos', icon: '📋' },
    { id: 'goals', label: 'Metas', icon: '🎯' },
    { id: 'productivity', label: 'Produtividade', icon: '⚡' }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Receita Total</p>
            <p className="text-2xl font-bold">R$ 32.300</p>
            <p className="text-blue-200 text-xs">+12% este mês</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
              </div>

        <div
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Projetos Ativos</p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-green-200 text-xs">4 concluídos</p>
          </div>
          <div className="text-3xl">📋</div>
        </div>
              </div>

        <div
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Metas Alcançadas</p>
            <p className="text-2xl font-bold">8/12</p>
            <p className="text-purple-200 text-xs">67% de sucesso</p>
          </div>
          <div className="text-3xl">🎯</div>
        </div>
              </div>

        <div
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Produtividade</p>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-orange-200 text-xs">+5% esta semana</p>
          </div>
          <div className="text-3xl">⚡</div>
        </div>
      </div>
    </div>
  );

  const renderFinances = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Receitas vs Despesas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.finances}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="1" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
                  </div>

          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Economias Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.finances}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="savings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Progresso dos Projetos
        </h3>
        <div className="space-y-4">
          {data.projects.map((project, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {project.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    style={{ width: `${project.progress}%` }}
                    className="bg-blue-500 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Progresso das Metas
        </h3>
        {data.goals && data.goals.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.goals}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, completed }) => `${name}: ${completed}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="completed"
              >
                {data.goals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-lg font-medium mb-2">Nenhuma meta cadastrada</h4>
            <p className="text-sm">Cadastre suas metas para ver o progresso aqui</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductivity = () => (
    <div className="space-y-6">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Produtividade Semanal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.productivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tasks" 
              stroke="#3B82F6" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'finances':
        return renderFinances();
      case 'projects':
        return renderProjects();
      case 'goals':
        return renderGoals();
      case 'productivity':
        return renderProductivity();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Relatórios & Analytics
        </h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          Exportar Relatório
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsDashboard;
