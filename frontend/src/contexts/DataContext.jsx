import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Estados centralizados
  const [goals, setGoals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [finances, setFinances] = useState([]);
  const [travels, setTravels] = useState([]);
  const [career, setCareer] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para atualizar todos os dados
  const refreshAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Atualizando dados via Context...');
      
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
      if (careerData) setCareer(careerData);

      console.log('✅ Dados atualizados via Context!');
    } catch (error) {
      console.error('❌ Erro ao atualizar dados via Context:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funções para atualizar estados específicos
  const addGoal = useCallback((newGoal) => {
    setGoals(prev => {
      const exists = prev.find(goal => goal.id === newGoal.id);
      if (exists) {
        return prev.map(goal => goal.id === newGoal.id ? newGoal : goal);
      }
      return [...prev, newGoal];
    });
  }, []);

  const updateGoal = useCallback((goalId, updatedGoal) => {
    setGoals(prev => prev.map(goal => goal.id === goalId ? updatedGoal : goal));
  }, []);

  const removeGoal = useCallback((goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setProjects(prev => prev.filter(project => project.goalId !== goalId));
    setCalendarEvents(prev => prev.filter(event => event.goalId !== goalId));
  }, []);

  const addProject = useCallback((newProject) => {
    setProjects(prev => {
      const exists = prev.find(project => project.id === newProject.id);
      if (exists) {
        return prev.map(project => project.id === newProject.id ? newProject : project);
      }
      return [...prev, newProject];
    });
  }, []);

  const updateProject = useCallback((projectId, updatedProject) => {
    setProjects(prev => prev.map(project => project.id === projectId ? updatedProject : project));
  }, []);

  const removeProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);

  const addEvent = useCallback((newEvent) => {
    setCalendarEvents(prev => {
      const exists = prev.find(event => event.id === newEvent.id);
      if (exists) {
        return prev.map(event => event.id === newEvent.id ? newEvent : event);
      }
      return [...prev, newEvent];
    });
  }, []);

  const updateEvent = useCallback((eventId, updatedEvent) => {
    setCalendarEvents(prev => prev.map(event => event.id === eventId ? updatedEvent : event));
  }, []);

  const removeEvent = useCallback((eventId) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const value = {
    // Estados
    goals,
    projects,
    calendarEvents,
    finances,
    travels,
    career,
    isLoading,
    
    // Funções de atualização
    refreshAllData,
    addGoal,
    updateGoal,
    removeGoal,
    addProject,
    updateProject,
    removeProject,
    addEvent,
    updateEvent,
    removeEvent,
    
    // Setters diretos (para compatibilidade)
    setGoals,
    setProjects,
    setCalendarEvents,
    setFinances,
    setTravels,
    setCareer
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

