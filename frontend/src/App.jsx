import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  initialProjects, 
  initialFinances, 
  initialBudget, 
  initialGoals, 
  initialTravels, 
  initialCareerPlanning, 
  initialCalendarEvents,
  planilhaFinanceira
} from './data/initialData';
import { viagensData } from './data/travelsData';
import { ThemeProvider } from './contexts/ThemeContext';
import { notificationService } from './services/notifications';
import apiService from './services/api';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ProjectsTab from './components/tabs/ProjectsTab';
import CalendarTab from './components/tabs/CalendarTab';
import FinancesTab from './components/tabs/FinancesTab';
import FinancialPlanningTab from './components/tabs/FinancialPlanningTab';
import CareerTab from './components/tabs/CareerTab';
import TravelsTab from './components/tabs/TravelsTab';
import SettingsTab from './components/tabs/SettingsTab';
import ProfileTab from './components/tabs/ProfileTab';
import ReportsDashboard from './components/analytics/ReportsDashboard';
import LoginScreen from './components/LoginScreen';
import RegisterForm from './components/auth/RegisterForm';
import EventModal from './components/modals/EventModal';
import TravelDetailModal from './components/modals/TravelDetailModal';
import EditTravelModal from './components/modals/EditTravelModal';
import NewTravelModal from './components/modals/NewTravelModal';
import NewGoalModal from './components/modals/NewGoalModal';
import GoalsSetupModal from './components/modals/GoalsSetupModal';

const App = () => {
  // Estado principal
  const [activeTab, setActiveTab] = useState('projects');
  const [activeSubTab, setActiveSubTab] = useState('calendar');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Estado do usuário
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showGoalsSetupModal, setShowGoalsSetupModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [pendingGoalData, setPendingGoalData] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingCareer, setEditingCareer] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [dataCache, setDataCache] = useState({});
  const [cacheTimestamp, setCacheTimestamp] = useState({});
  
  // Estados para viagens
  const [currentTravelPage, setCurrentTravelPage] = useState(1);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [showEditTravelModal, setShowEditTravelModal] = useState(false);
  const [showNewTravelModal, setShowNewTravelModal] = useState(false);
  const [activeTravelTab, setActiveTravelTab] = useState('planejado');

  // Estados com dados do backend
  const [projects, setProjects] = useState([]);
  const [finances, setFinances] = useState([]);
  const [budget, setBudget] = useState(initialBudget);
  const [goals, setGoals] = useState([]);
  const [travels, setTravels] = useState([]);
  const [careerPlanning, setCareerPlanning] = useState(initialCareerPlanning);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [viagensDataState, setViagensDataState] = useState([]);
  const [planilhaFinanceiraState, setPlanilhaFinanceiraState] = useState([]);

  // Função para limpar dados e recarregar do backend
  const resetToInitialData = async () => {
    try {
      // Recarregar dados do backend
      const [projectsData, goalsData, financesData, travelsData, calendarData, careerData] = await Promise.all([
        apiService.projects.getAll().catch(() => []),
        apiService.goals.getAll().catch(() => []),
        apiService.finances.getAll().catch(() => []),
        apiService.travels.getAll().catch(() => []),
        apiService.calendar.getAll().catch(() => []),
        apiService.career.getAll().catch(() => [])
      ]);

      // Atualizar estados
      if (projectsData) setProjects(projectsData);
      if (goalsData) setGoals(goalsData);
      if (financesData) setFinances(financesData);
      if (travelsData) {
        setTravels(travelsData);
        setViagensDataState(travelsData); // Atualizar também viagensDataState
      }
      if (calendarData) setCalendarEvents(calendarData);
      if (careerData) setPlanilhaFinanceiraState(careerData);

      console.log('Dados recarregados do backend!');
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  };

  // Função para lidar com login
  const handleLogin = async (loginData) => {
    console.log('Login realizado:', loginData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', loginData.user?.email || loginData.email || '');
    
    // Salvar token se fornecido
    if (loginData.token) {
      apiService.setToken(loginData.token);
    }

    // Buscar perfil do usuário do banco de dados
    try {
      const profileResponse = await apiService.user.getProfile();
      if (profileResponse.data) {
        setUserName(profileResponse.data.name || 'Usuário');
        setUserEmail(profileResponse.data.email || '');
        console.log('✅ Perfil carregado do banco de dados');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      // Fallback para dados do login
      setUserName(loginData.user?.name || loginData.name || loginData.email || 'Usuário');
      setUserEmail(loginData.user?.email || loginData.email || '');
    }
  };

  // Função para logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    apiService.setToken(null); // Limpar token
  };

  // Verificar se há login salvo ao carregar a página
  React.useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    const savedToken = localStorage.getItem('token');
    
    if (savedLogin === 'true' && savedToken) {
      setIsLoggedIn(true);
      apiService.setToken(savedToken); // Restaurar token
      
      // Buscar perfil do usuário do banco de dados
      const loadUserProfile = async () => {
        try {
          const profileResponse = await apiService.user.getProfile();
          if (profileResponse.data) {
            setUserName(profileResponse.data.name || 'Usuário');
            setUserEmail(profileResponse.data.email || '');
            console.log('✅ Perfil carregado do banco de dados');
          }
        } catch (error) {
          console.error('❌ Erro ao carregar perfil:', error);
        }
      };
      
      loadUserProfile();
    }
  }, []);

  // Carregar dados do backend quando logado
  useEffect(() => {
    if (isLoggedIn) {
      const loadDataFromBackend = async () => {
        try {
          // Carregar todos os dados do backend
          const [projectsData, goalsData, financesData, travelsData, calendarData, careerData] = await Promise.all([
            apiService.projects.getAll().catch(() => []),
            apiService.goals.getAll().catch(() => []),
            apiService.finances.getAll().catch(() => []),
            apiService.travels.getAll().catch(() => []),
            apiService.calendar.getAll().catch(() => []),
            apiService.career.getAll().catch(() => [])
          ]);

          // Atualizar estados com dados do backend
          if (projectsData) setProjects(projectsData);
          if (goalsData) setGoals(goalsData);
          if (financesData) setFinances(financesData);
          if (travelsData) {
            setTravels(travelsData);
            setViagensDataState(travelsData); // Atualizar também viagensDataState
          }
          if (calendarData) setCalendarEvents(calendarData);
          if (careerData) setPlanilhaFinanceiraState(careerData);

          console.log('Dados carregados do backend com sucesso!');
        } catch (error) {
          console.error('Erro ao carregar dados do backend:', error);
        }
      };

      loadDataFromBackend();
    }
  }, [isLoggedIn]);

  // Inicializar serviços
  useEffect(() => {
    if (isLoggedIn) {
      // Inicializar notificações
      notificationService.setupAutomaticReminders();
    }
  }, [isLoggedIn]);

  // Polling inteligente - verificar mudanças a cada 30 segundos
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      try {
        // Verificar se houve mudanças no backend (implementação simples)
        const [projectsData, goalsData] = await Promise.all([
          apiService.projects.getAll().catch(() => []),
          apiService.goals.getAll().catch(() => [])
        ]);

        // Comparar com dados locais
        const hasChanges = 
          JSON.stringify(projectsData) !== JSON.stringify(projects) ||
          JSON.stringify(goalsData) !== JSON.stringify(goals);

        if (hasChanges) {
          console.log('🔄 Mudanças detectadas no backend, atualizando...');
          await refreshAllData();
          setLastUpdate(Date.now());
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isLoggedIn]); // Corrigido para usar isLoggedIn

  // Os dados agora são salvos diretamente no backend quando modificados

  // Funções auxiliares
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    
    // Buscar eventos do calendário
    const events = calendarEvents.filter(event => event.date === dateString);
    
    // Buscar metas que têm data de vencimento
    const goalsForDate = goals.filter(goal => {
      if (goal.dueDate) {
        const goalDate = new Date(goal.dueDate).toISOString().split('T')[0];
        return goalDate === dateString;
      }
      return false;
    }).map(goal => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      type: 'goal',
      date: dateString,
      description: goal.description,
      progress: goal.progress
    }));
    
    return [...events, ...goalsForDate];
  };

  const addEvent = (eventData) => {
    if (!selectedDate) {
      console.error('Nenhuma data selecionada');
      alert('Erro: Por favor, selecione uma data primeiro.');
      setShowEventModal(false);
      return;
    }
    
    const newEvent = {
      id: Date.now(),
      ...eventData,
      date: selectedDate.toISOString().split('T')[0],
      type: 'custom'
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    setShowEventModal(false);
    setSelectedDate(null);
  };

    const addNewGoal = (goalData) => {
    if (editingGoal) {
      // Modo de edição - atualizar meta existente
      const updatedGoals = goals.map(goal => 
        goal.id === editingGoal.id 
          ? { ...goal, ...goalData, totalGoals: goalData.totalGoals }
          : goal
      );
      setGoals(updatedGoals);

      // Atualizar projeto correspondente
      const updatedProjects = projects.map(project => 
        project.goalId === editingGoal.id 
          ? { ...project, ...goalData, totalGoals: goalData.totalGoals }
          : project
      );
      setProjects(updatedProjects);

      // Limpar estado de edição
      setEditingGoal(null);
      setShowNewGoalModal(false);
      return;
    }

    // Modo de criação - salvar os dados da meta para usar no modal de goals
    setPendingGoalData(goalData);

    // Abrir o modal de configuração de goals
    setShowGoalsSetupModal(true);
  };

  const handleGoalsSetupComplete = async (goalsList) => {
    if (!pendingGoalData) return;

    // Calcular progresso inicial baseado nos goals
    const completedGoals = goalsList.filter(goal => goal.done).length;
    const progress = Math.round((completedGoals / goalsList.length) * 100);

    // Criar a meta com os goals
    const newGoal = {
      category: pendingGoalData.category || 'Sem categoria',
      title: pendingGoalData.title,
      description: pendingGoalData.description || '',
      progress: progress,
      dueDate: pendingGoalData.dueDate,
      estimatedHours: pendingGoalData.estimatedHours || 0,
      status: 'pending',
      priority: pendingGoalData.priority || 'medium',
      totalGoals: goalsList.length,
      goals: goalsList,
      createdAt: new Date().toISOString(),
      type: 'goal'
    };

    // Salvar no backend
    let savedGoal;
    try {
      const response = await apiService.goals.create(newGoal);
      savedGoal = response.data || response; // Lidar com ambos os formatos
      addGoalToState(savedGoal); // Atualizar estado automaticamente
      console.log('✅ Meta salva no backend!', savedGoal);
    } catch (error) {
      console.error('❌ Erro ao salvar meta no backend:', error);
      alert('❌ Erro ao salvar meta. Verifique sua conexão.');
      return; // Não salvar localmente se backend falhar
    }

    // Criar um projeto baseado na meta (com todos os dados necessários)
    const newProject = {
      title: pendingGoalData.title,
      description: pendingGoalData.description,
      category: pendingGoalData.category || 'Sem categoria',
      tags: pendingGoalData.tags || [],
      assignee: 'U',
      dueDate: pendingGoalData.dueDate,
      progress: progress,
      estimatedHours: pendingGoalData.estimatedHours || 0,
      status: 'todo',
      priority: pendingGoalData.priority || 'medium',
      type: 'goal',
      goalId: savedGoal.id, // Usar o ID da meta salva
      goals: goalsList // Incluir os goals no projeto para sincronização
    };

    // Salvar projeto no backend
    try {
      const response = await apiService.projects.create(newProject);
      const savedProject = response.data || response; // Lidar com ambos os formatos
      addProjectToState(savedProject); // Atualizar estado automaticamente
      console.log('✅ Projeto salvo no backend!', savedProject);
    } catch (error) {
      console.error('❌ Erro ao salvar projeto no backend:', error);
      alert('❌ Erro ao salvar projeto. Verifique sua conexão.');
      return; // Não salvar localmente se backend falhar
    }

    // Adicionar evento no calendário para a data da meta
    const calendarEvent = {
      title: `🎯 ${pendingGoalData.title}`,
      description: pendingGoalData.description,
      startDate: pendingGoalData.dueDate,
      endDate: pendingGoalData.dueDate,
      type: 'goal',
      goalId: savedGoal.id, // Usar o ID da meta salva
      priority: pendingGoalData.priority
    };

    // Salvar evento no backend
    try {
      const response = await apiService.calendar.create(calendarEvent);
      const savedEvent = response.data || response; // Lidar com ambos os formatos
      addEventToState(savedEvent); // Atualizar estado automaticamente
      console.log('✅ Evento salvo no backend!', savedEvent);
    } catch (error) {
      console.error('❌ Erro ao salvar evento no backend:', error);
      alert('❌ Erro ao salvar evento. Verifique sua conexão.');
      return; // Não salvar localmente se backend falhar
    }

    // Limpar dados pendentes e fechar modais
    setPendingGoalData(null);
    setShowGoalsSetupModal(false);
    setShowNewGoalModal(false);

    // Forçar atualização de todos os dados para garantir sincronização
    await refreshAllData();

    // Redirecionar para a aba de metas para mostrar a nova meta
    setActiveTab('projects');
  };

  // Função para sincronizar progresso entre metas e projetos
  const syncGoalProgress = (goalId, updatedGoal) => {
    // Atualizar a meta localmente
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? updatedGoal
          : goal
      )
    );

    // Atualizar o projeto correspondente
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.goalId === goalId 
          ? { ...project, goals: updatedGoal.goals, progress: updatedGoal.progress }
          : project
      )
    );

    // Salvar atualização no backend
    const updateGoalInBackend = async () => {
      try {
        await apiService.goals.update(goalId, updatedGoal);
        console.log('✅ Progresso sincronizado no backend');
      } catch (error) {
        console.error('❌ Erro ao sincronizar no backend:', error);
      }
    };

    updateGoalInBackend();
  };

  // Função para atualizar estado após criar meta (Otimistic Update)
  const addGoalToState = (newGoal) => {
    setGoals(prevGoals => {
      // Verificar se já existe para evitar duplicatas
      const exists = prevGoals.find(goal => goal.id === newGoal.id);
      if (exists) {
        return prevGoals.map(goal => goal.id === newGoal.id ? newGoal : goal);
      }
      return [...prevGoals, newGoal];
    });
  };

  // Função para atualizar estado após criar projeto
  const addProjectToState = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  // Função para atualizar estado após criar evento
  const addEventToState = (newEvent) => {
    setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Função para forçar atualização de todos os dados com cache inteligente
  const refreshAllData = async (force = false) => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Atualizando todos os dados...');
      
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutos
      
      // Verificar cache para cada tipo de dado
      const shouldFetch = (type) => {
        if (force) return true;
        const lastFetch = cacheTimestamp[type] || 0;
        return (now - lastFetch) > cacheExpiry;
      };

      const fetchPromises = [];
      const fetchTypes = [];

      if (shouldFetch('projects')) {
        fetchPromises.push(apiService.projects.getAll().catch(() => []));
        fetchTypes.push('projects');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.projects || []));
      }

      if (shouldFetch('goals')) {
        fetchPromises.push(apiService.goals.getAll().catch(() => []));
        fetchTypes.push('goals');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.goals || []));
      }

      if (shouldFetch('finances')) {
        fetchPromises.push(apiService.finances.getAll().catch(() => []));
        fetchTypes.push('finances');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.finances || []));
      }

      if (shouldFetch('travels')) {
        fetchPromises.push(apiService.travels.getAll().catch(() => []));
        fetchTypes.push('travels');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.travels || []));
      }

      if (shouldFetch('calendar')) {
        fetchPromises.push(apiService.calendar.getAll().catch(() => []));
        fetchTypes.push('calendar');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.calendar || []));
      }

      if (shouldFetch('career')) {
        fetchPromises.push(apiService.career.getAll().catch(() => []));
        fetchTypes.push('career');
      } else {
        fetchPromises.push(Promise.resolve(dataCache.career || []));
      }

      const [projectsData, goalsData, financesData, travelsData, calendarData, careerData] = await Promise.all(fetchPromises);

      // Atualizar cache e timestamps
      const newCache = { ...dataCache };
      const newTimestamps = { ...cacheTimestamp };
      
      if (fetchTypes.includes('projects')) {
        newCache.projects = projectsData;
        newTimestamps.projects = now;
      }
      if (fetchTypes.includes('goals')) {
        newCache.goals = goalsData;
        newTimestamps.goals = now;
      }
      if (fetchTypes.includes('finances')) {
        newCache.finances = financesData;
        newTimestamps.finances = now;
      }
      if (fetchTypes.includes('travels')) {
        newCache.travels = travelsData;
        newTimestamps.travels = now;
      }
      if (fetchTypes.includes('calendar')) {
        newCache.calendar = calendarData;
        newTimestamps.calendar = now;
      }
      if (fetchTypes.includes('career')) {
        newCache.career = careerData;
        newTimestamps.career = now;
      }

      setDataCache(newCache);
      setCacheTimestamp(newTimestamps);

      // Atualizar estados com dados do backend
      if (projectsData) setProjects(projectsData);
      if (goalsData) setGoals(goalsData);
      if (financesData) setFinances(financesData);
      if (travelsData) {
        setTravels(travelsData);
        setViagensDataState(travelsData);
      }
      if (calendarData) setCalendarEvents(calendarData);
      if (careerData) setPlanilhaFinanceiraState(careerData);

      console.log('✅ Todos os dados atualizados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para atualizar estado após editar meta
  const updateGoalInState = (goalId, updatedGoal) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => goal.id === goalId ? updatedGoal : goal)
    );
  };

  // Função para atualizar estado após editar projeto
  const updateProjectInState = (projectId, updatedProject) => {
    setProjects(prevProjects => 
      prevProjects.map(project => project.id === projectId ? updatedProject : project)
    );
  };

  // Função para remover meta do estado
  const removeGoalFromState = (goalId) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    setProjects(prevProjects => prevProjects.filter(project => project.goalId !== goalId));
    setCalendarEvents(prevEvents => prevEvents.filter(event => event.goalId !== goalId));
  };

  // Função para remover meta e projeto correspondente
  const removeGoalAndProject = async (goalId) => {
    try {
      console.log('🗑️ Iniciando remoção da meta:', goalId);
      console.log('🗑️ Tipo do ID:', typeof goalId);
      console.log('🗑️ ID string:', String(goalId));
      
      // Remover meta do backend
      await apiService.goals.delete(goalId);
      console.log('✅ Meta removida do backend');
      
      // Remover projeto relacionado do backend
      const projectToRemove = projects.find(p => p.goalId === goalId);
      console.log('🔍 Projeto encontrado para remoção:', projectToRemove);
      if (projectToRemove) {
        console.log('🗑️ Removendo projeto ID:', projectToRemove.id);
        await apiService.projects.delete(projectToRemove.id);
        console.log('✅ Projeto removido do backend');
      } else {
        console.log('⚠️ Nenhum projeto encontrado para a meta ID:', goalId);
      }
      
      // Remover evento do calendário do backend
      const eventToRemove = calendarEvents.find(e => e.goalId === goalId);
      if (eventToRemove) {
        await apiService.calendar.delete(eventToRemove.id);
        console.log('✅ Evento removido do backend');
      }
      
      // Só remover do estado local após confirmar que foi removido do backend
      removeGoalFromState(goalId);
      console.log('✅ Meta removida do estado local');
      
    } catch (error) {
      console.error('❌ Erro ao remover do backend:', error);
      alert('❌ Erro ao excluir meta. Verifique sua conexão.');
    }
  };

  // Função para adicionar nova viagem
  const addNewTravel = async (travelData) => {
    try {
      // Preparar dados para o backend (apenas campos válidos do schema)
      const backendTravelData = {
        semana: viagensDataState.length + 1,
        inicio: travelData.startDate || '',
        fim: travelData.endDate || '',
        cidade: travelData.destination || '',
        pais: travelData.country || '',
        zona: travelData.zone || '',
        hospedagem_planejado: travelData.hospedagem_base || 0,
        alimentacao_planejado: travelData.alimentacao_base || 0,
        transporte_planejado: travelData.transporte_base || 0,
        academia_planejado: travelData.academia_base || 0,
        suplementos_planejado: travelData.suplementos_base || 0,
        atividades_planejado: travelData.atividades_base || 0,
        total_planejado: travelData.subtotal_base || 0
      };

      // Salvar no backend
      const savedTravel = await apiService.travels.create(backendTravelData);
      
      // Adicionar campos de compatibilidade para exibição
      const newTravel = {
        ...savedTravel.data,
        rating: 8.0,
        // Campos de compatibilidade para exibição nos cards
        distotal: travelData.subtotal_base || 0,
        longdist: travelData.subtotal_alto || 0,
        hospedagem: travelData.hospedagem_base || 0,
        tentacao: travelData.alimentacao_base || 0,
        importe: travelData.transporte_base || 0,
        bagemia: travelData.academia_base || 0,
        bimentos: travelData.suplementos_base || 0,
        cidades: travelData.atividades_base || 0,
        notes: travelData.seguro_base || 0
      };
      
      setViagensDataState([...viagensDataState, newTravel]);
      setShowNewTravelModal(false);
      console.log('✅ Viagem criada no backend:', newTravel);
    } catch (error) {
      console.error('❌ Erro ao criar viagem:', error);
      alert('❌ Erro ao criar viagem. Verifique sua conexão.');
    }
  };

  // Tab content renderer
  const renderContent = () => {
    console.log('renderContent chamado com activeTab:', activeTab);
    // Se Perfil ou Configurações estiverem ativos, mostrar eles


    switch (activeTab) {
      case 'projects':
        return (
          <ProjectsTab 
            projects={goals}
            setProjects={setGoals}
            draggedItem={draggedItem}
            setDraggedItem={setDraggedItem}
            showAddModal={showNewGoalModal}
            setShowAddModal={setShowNewGoalModal}
            removeGoalAndProject={removeGoalAndProject}
            setActiveTab={setActiveTab}
            setActiveSubTab={setActiveSubTab}
            goals={goals}
            setGoals={setGoals}
            syncGoalProgress={syncGoalProgress}
            setEditingGoal={setEditingGoal}
          />
        );
      case 'calendar':
        return (
          <CalendarTab 
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            calendarEvents={calendarEvents}
            goals={goals}
            setGoals={setGoals}
            setShowEventModal={setShowEventModal}
            setSelectedDate={setSelectedDate}
            getEventsForDate={getEventsForDate}
            syncGoalProgress={syncGoalProgress}
            setShowNewGoalModal={setShowNewGoalModal}
            setEditingGoal={setEditingGoal}
            removeGoalAndProject={removeGoalAndProject}
          />
        );
      case 'finances':
        return (
          <FinancesTab 
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            finances={finances}
            setFinances={setFinances}
            budget={budget}
            setBudget={setBudget}
            editingBudget={editingBudget}
            setEditingBudget={setEditingBudget}
            planilhaFinanceira={planilhaFinanceiraState}
            planilhaFinanceiraState={planilhaFinanceiraState}
            setPlanilhaFinanceiraState={setPlanilhaFinanceiraState}
          />
        );
              case 'career':
          return (
            <CareerTab 
              careerPlanning={careerPlanning}
              setCareerPlanning={setCareerPlanning}
              editingCareer={editingCareer}
              setEditingCareer={setEditingCareer}
              finances={finances}
              setFinances={setFinances}
            />
          );
      case 'travels':
        return (
          <TravelsTab 
            travels={travels}
            viagensData={viagensDataState}
            currentTravelPage={currentTravelPage}
            setCurrentTravelPage={setCurrentTravelPage}
            setSelectedTravel={setSelectedTravel}
            setShowTravelModal={setShowTravelModal}
            setEditingTravel={(travel) => {
              setEditingTravel(travel);
              setShowEditTravelModal(true);
            }}
            setShowNewTravelModal={setShowNewTravelModal}
            activeTravelTab={activeTravelTab}
            setActiveTravelTab={setActiveTravelTab}
          />
        );
      case 'profile':
        return (
          <ProfileTab 
            careerPlanning={careerPlanning}
            setCareerPlanning={setCareerPlanning}
            userName={userName}
            userEmail={userEmail}
          />
        );
      case 'settings':
        return (
          <SettingsTab 
            setViagensDataState={setViagensDataState}
            setFinances={setFinances}
            setPlanilhaFinanceiraState={setPlanilhaFinanceiraState}
          />
        );
      case 'reports':
        return (
          <ReportsDashboard />
        );

      default:
        return (
          <ProjectsTab 
            projects={projects}
            setProjects={setProjects}
            draggedItem={draggedItem}
            setDraggedItem={setDraggedItem}
            showAddModal={showNewGoalModal}
            setShowAddModal={setShowNewGoalModal}
            removeGoalAndProject={removeGoalAndProject}
          />
        );
    }
  };

  // Se não estiver logado, mostrar tela de login
  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        {showRegister ? (
          <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginScreen 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-purple-900 flex flex-col relative">
        {/* Efeito Spline com transparência */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
        
        {/* Efeito de partículas do login */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Partículas grandes */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400/20 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-2/3 left-1/3 w-2.5 h-2.5 bg-cyan-400/25 rounded-full animate-ping" style={{animationDuration: '5s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-pulse" style={{animationDuration: '6s'}}></div>
          <div className="absolute top-3/4 left-1/2 w-3 h-3 bg-blue-300/30 rounded-full animate-bounce" style={{animationDuration: '7s'}}></div>
          <div className="absolute top-1/6 right-1/6 w-2 h-2 bg-cyan-300/25 rounded-full animate-ping" style={{animationDuration: '8s'}}></div>
          <div className="absolute top-5/6 left-1/6 w-1.5 h-1.5 bg-purple-400/35 rounded-full animate-pulse" style={{animationDuration: '9s'}}></div>
          <div className="absolute top-2/5 right-1/5 w-2.5 h-2.5 bg-blue-400/25 rounded-full animate-bounce" style={{animationDuration: '10s'}}></div>
          
          {/* Partículas médias */}
          <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{animationDuration: '2s'}}></div>
          <div className="absolute top-2/5 right-1/5 w-1.5 h-1.5 bg-blue-400/35 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-3/5 left-2/5 w-1 h-1 bg-cyan-400/30 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-4/5 right-2/5 w-1.5 h-1.5 bg-purple-300/45 rounded-full animate-pulse" style={{animationDuration: '5s'}}></div>
          
          {/* Partículas pequenas */}
          <div className="absolute top-1/8 left-3/4 w-0.5 h-0.5 bg-blue-300/50 rounded-full animate-pulse" style={{animationDuration: '1.5s'}}></div>
          <div className="absolute top-3/8 right-1/8 w-0.5 h-0.5 bg-cyan-300/40 rounded-full animate-bounce" style={{animationDuration: '2.5s'}}></div>
          <div className="absolute top-5/8 left-1/8 w-0.5 h-0.5 bg-purple-300/45 rounded-full animate-ping" style={{animationDuration: '3.5s'}}></div>
          <div className="absolute top-7/8 right-3/4 w-0.5 h-0.5 bg-blue-400/35 rounded-full animate-pulse" style={{animationDuration: '4.5s'}}></div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1">
          <Header />
        
        <Navigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setActiveSubTab={setActiveSubTab}
          setShowProfile={setShowProfile}
          setShowSettings={setShowSettings}
          onLogout={handleLogout}
          showReports={showReports}
          setShowReports={setShowReports}
          isGoogleCalendarConnected={isGoogleCalendarConnected}
          userName={userName}
          style={{position: 'relative', zIndex: 50}}
        />

        <main className="flex-1 p-3 md:p-4 overflow-y-auto relative">
          {renderContent()}
        </main>



      {/* Modals */}
      {showEventModal && selectedDate && (
        <EventModal 
          selectedDate={selectedDate}
          setShowEventModal={setShowEventModal}
          setSelectedDate={setSelectedDate}
          addEvent={addEvent}
        />
      )}
      
      {showTravelModal && selectedTravel && (
        <TravelDetailModal 
          selectedTravel={selectedTravel}
          setShowTravelModal={setShowTravelModal}
          viagensData={viagensDataState}
          setEditingTravel={setEditingTravel}
          setShowEditTravelModal={setShowEditTravelModal}
          isRealizadoTab={activeTravelTab === 'realizado'}
        />
      )}

      {showEditTravelModal && editingTravel && (
        <EditTravelModal 
          isOpen={showEditTravelModal}
          onClose={() => {
            setShowEditTravelModal(false);
            setEditingTravel(null);
          }}
          isRealizadoMode={activeTravelTab === 'realizado'}
          onSave={async (updatedTravel) => {
            try {
              // Salvar no backend se tiver ID válido (string)
              if (updatedTravel.id && typeof updatedTravel.id === 'string') {
                // Preparar dados para o backend (apenas campos válidos)
                const backendUpdateData = {
                  hospedagem_realizado: updatedTravel.hospedagem_realizado || 0,
                  alimentacao_realizado: updatedTravel.alimentacao_realizado || 0,
                  transporte_realizado: updatedTravel.transporte_realizado || 0,
                  academia_realizado: updatedTravel.academia_realizado || 0,
                  suplementos_realizado: updatedTravel.suplementos_realizado || 0,
                  atividades_realizado: updatedTravel.atividades_realizado || 0,
                  total_realizado: updatedTravel.total_realizado || 0,
                  confirmada: updatedTravel.confirmada || false,
                  rating: updatedTravel.rating || 8.0,
                  notas: updatedTravel.notas || updatedTravel.bloco || ''
                };
                
                await apiService.travels.update(updatedTravel.id, backendUpdateData);
              }
              
              // Atualizar os dados locais
              const updatedViagensData = viagensDataState.map(travel => 
                travel.id === updatedTravel.id ? updatedTravel : travel
              );
              setViagensDataState(updatedViagensData);
              setShowEditTravelModal(false);
              setEditingTravel(null);
              
              console.log('✅ Viagem salva com sucesso!', updatedTravel);
            } catch (error) {
              console.error('❌ Erro ao salvar viagem:', error);
              // Mesmo com erro no backend, atualizar localmente
              const updatedViagensData = viagensDataState.map(travel => 
                travel.id === updatedTravel.id ? updatedTravel : travel
              );
              setViagensDataState(updatedViagensData);
              setShowEditTravelModal(false);
              setEditingTravel(null);
            }
          }}
          travelData={editingTravel}
        />
      )}

      {showNewTravelModal && (
        <NewTravelModal 
          isOpen={showNewTravelModal}
          onClose={() => setShowNewTravelModal(false)}
          onSave={addNewTravel}
        />
      )}

      {showNewGoalModal && (
        <NewGoalModal 
          isOpen={showNewGoalModal}
          onClose={() => {
            setShowNewGoalModal(false);
            setEditingGoal(null);
          }}
          onSaveGoal={addNewGoal}
          editingGoal={editingGoal}
        />
      )}

      {showGoalsSetupModal && pendingGoalData && (
        <GoalsSetupModal 
          isOpen={showGoalsSetupModal}
          onClose={() => {
            setShowGoalsSetupModal(false);
            setPendingGoalData(null);
          }}
          onSaveGoals={handleGoalsSetupComplete}
          metaData={pendingGoalData}
          totalGoals={pendingGoalData.totalGoals}
        />
      )}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
