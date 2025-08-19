import React, { useState, useEffect } from 'react';
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
  
  // Estados para viagens
  const [currentTravelPage, setCurrentTravelPage] = useState(1);
  const [selectedTravel, setSelectedTravel] = useState(null);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [editingTravel, setEditingTravel] = useState(null);
  const [showEditTravelModal, setShowEditTravelModal] = useState(false);
  const [showNewTravelModal, setShowNewTravelModal] = useState(false);

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
      if (travelsData) setTravels(travelsData);
      if (calendarData) setCalendarEvents(calendarData);
      if (careerData) setPlanilhaFinanceiraState(careerData);

      console.log('Dados recarregados do backend!');
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  };

  // Função para lidar com login
  const handleLogin = (loginData) => {
    console.log('Login realizado:', loginData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Salvar token se fornecido
    if (loginData.token) {
      apiService.setToken(loginData.token);
    }
  };

  // Função para logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    apiService.setToken(null); // Limpar token
  };

  // Verificar se há login salvo ao carregar a página
  React.useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    const savedToken = localStorage.getItem('token');
    
    if (savedLogin === 'true' && savedToken) {
      setIsLoggedIn(true);
      apiService.setToken(savedToken); // Restaurar token
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
          if (travelsData) setTravels(travelsData);
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
      ...pendingGoalData,
      progress: progress,
      totalGoals: goalsList.length,
      goals: goalsList,
      createdAt: new Date().toISOString(),
      type: 'goal'
    };

    // Salvar no backend
    try {
      const savedGoal = await apiService.goals.create(newGoal);
      setGoals([...goals, savedGoal]);
      console.log('✅ Meta salva no backend!');
    } catch (error) {
      console.error('❌ Erro ao salvar meta no backend:', error);
      alert('❌ Erro ao salvar meta. Verifique sua conexão.');
      return; // Não salvar localmente se backend falhar
    }

    // Criar um projeto baseado na meta
    const newProject = {
      title: pendingGoalData.title,
      description: pendingGoalData.description,
      status: 'todo',
      priority: pendingGoalData.priority,
      category: pendingGoalData.category,
      tags: pendingGoalData.tags,
      assignees: ['U'],
      dueDate: pendingGoalData.dueDate,
      progress: progress,
      estimatedHours: pendingGoalData.estimatedHours,
      actualHours: 0,
      type: 'goal',
      goalId: newGoal.id,
      goals: goalsList // Incluir os goals no projeto para sincronização
    };

    // Salvar projeto no backend
    try {
      const savedProject = await apiService.projects.create(newProject);
      setProjects([...projects, savedProject]);
      console.log('✅ Projeto salvo no backend!');
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
      goalId: newGoal.id,
      priority: pendingGoalData.priority
    };

    // Salvar evento no backend
    try {
      const savedEvent = await apiService.calendar.create(calendarEvent);
      setCalendarEvents([...calendarEvents, savedEvent]);
      console.log('✅ Evento salvo no backend!');
    } catch (error) {
      console.error('❌ Erro ao salvar evento no backend:', error);
      alert('❌ Erro ao salvar evento. Verifique sua conexão.');
      return; // Não salvar localmente se backend falhar
    }

    // Limpar dados pendentes e fechar modais
    setPendingGoalData(null);
    setShowGoalsSetupModal(false);
    setShowNewGoalModal(false);

    // Redirecionar para a aba de metas para mostrar a nova meta
    setActiveTab('calendar');
    setActiveSubTab('goals');
  };

  // Função para sincronizar progresso entre metas e projetos
  const syncGoalProgress = (goalId, updatedGoals) => {
    const completedGoals = updatedGoals.filter(goal => goal.done).length;
    const progress = Math.round((completedGoals / updatedGoals.length) * 100);

    // Atualizar a meta
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, goals: updatedGoals, progress }
          : goal
      )
    );

    // Atualizar o projeto correspondente
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.goalId === goalId 
          ? { ...project, goals: updatedGoals, progress }
          : project
      )
    );
  };

  // Função para remover meta e projeto correspondente
  const removeGoalAndProject = (goalId) => {
    setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
    setProjects(prevProjects => prevProjects.filter(p => p.goalId !== goalId));
    setCalendarEvents(prevEvents => prevEvents.filter(e => e.goalId !== goalId));
  };

  // Função para adicionar nova viagem
  const addNewTravel = (travelData) => {
    const newTravel = {
      id: Date.now(),
      semana: viagensDataState.length + 1,
      ...travelData,
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
  };

  // Tab content renderer
  const renderContent = () => {
    // Se Perfil ou Configurações estiverem ativos, mostrar eles
    if (showProfile) {
      return (
        <ProfileTab 
          careerPlanning={careerPlanning}
          setCareerPlanning={setCareerPlanning}
          onBack={() => {
            setShowProfile(false);
            setShowSettings(false);
          }}
        />
      );
    }
    
    if (showSettings) {
      return (
        <SettingsTab 
          setViagensDataState={setViagensDataState}
          setFinances={setFinances}
          setPlanilhaFinanceiraState={setPlanilhaFinanceiraState}
          onBack={() => {
            setShowProfile(false);
            setShowSettings(false);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'projects':
        return (
          <ProjectsTab 
            projects={projects}
            setProjects={setProjects}
            draggedItem={draggedItem}
            setDraggedItem={setDraggedItem}
            showAddModal={showNewGoalModal}
            setShowAddModal={setShowNewGoalModal}
            removeGoalAndProject={removeGoalAndProject}
            setActiveTab={setActiveTab}
            setActiveSubTab={setActiveSubTab}
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
          />
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
      <div className="h-full bg-gray-900 flex flex-col">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowUserMenu={setShowUserMenu}
          showUserMenu={showUserMenu}
          resetToInitialData={resetToInitialData}
          onLogout={handleLogout}
          setShowProfile={setShowProfile}
          setShowSettings={setShowSettings}
        />
        
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
        />

        <main className="flex-1 p-6 overflow-auto">
          {showReports ? (
            <ReportsDashboard />
          ) : (
            renderContent()
          )}
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
        />
      )}

      {showEditTravelModal && editingTravel && (
        <EditTravelModal 
          isOpen={showEditTravelModal}
          onClose={() => {
            setShowEditTravelModal(false);
            setEditingTravel(null);
          }}
          onSave={(updatedTravel) => {
            // Atualizar os dados da viagem
            const updatedViagensData = viagensDataState.map(travel => 
              travel.id === updatedTravel.id ? updatedTravel : travel
            );
            setViagensDataState(updatedViagensData);
            setShowEditTravelModal(false);
            setEditingTravel(null);
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
    </ThemeProvider>
  );
};

export default App;
