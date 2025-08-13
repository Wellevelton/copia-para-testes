// API Service for Planner Pro
// Centralized API calls to backend

// BACKEND URL - VERCEL API
const API_BASE_URL = '/api/server';

// Token management
const getToken = () => {
  return localStorage.getItem('token');
};

const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Authenticated request helper
const authenticatedRequest = async (url, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// API Objects
export const apiService = {
  setToken,
  getToken,
  
  // Auth API
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no login');
      }

      return response.json();
    },

    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no registro');
      }

      return response.json();
    },

    googleLogin: () => {
      alert('Google login não implementado ainda');
    },
  },

  // Projects API
  projects: {
    getAll: async () => {
      return authenticatedRequest('/projects');
    },

    create: async (project) => {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar projeto');
      }

      return response.json();
    },

    update: async (id, project) => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar projeto');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar projeto');
      }

      return true;
    },
  },

  // Goals API
  goals: {
    getAll: async () => {
      return authenticatedRequest('/goals');
    },

    create: async (goal) => {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar meta');
      }

      return response.json();
    },

    update: async (id, goal) => {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar meta');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar meta');
      }

      return true;
    },
  },

  // Finances API
  finances: {
    getAll: async () => {
      return authenticatedRequest('/finances');
    },

    create: async (finance) => {
      const response = await fetch(`${API_BASE_URL}/finances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(finance),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar financeiro');
      }

      return response.json();
    },

    update: async (id, finance) => {
      const response = await fetch(`${API_BASE_URL}/finances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(finance),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar financeiro');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/finances/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar financeiro');
      }

      return true;
    },
  },

  // Financial Planning API
  financialPlanning: {
    getAll: async () => {
      return authenticatedRequest('/financial-planning');
    },

    create: async (planning) => {
      const response = await fetch(`${API_BASE_URL}/financial-planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(planning),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar planejamento financeiro');
      }

      return response.json();
    },

    update: async (id, planning) => {
      const response = await fetch(`${API_BASE_URL}/financial-planning/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(planning),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar planejamento financeiro');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/financial-planning/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar planejamento financeiro');
      }

      return true;
    },
  },

  // Travels API
  travels: {
    getAll: async () => {
      return authenticatedRequest('/travels');
    },

    create: async (travel) => {
      const response = await fetch(`${API_BASE_URL}/travels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(travel),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar viagem');
      }

      return response.json();
    },

    update: async (id, travel) => {
      const response = await fetch(`${API_BASE_URL}/travels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(travel),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar viagem');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/travels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar viagem');
      }

      return true;
    },
  },

  // Career API
  career: {
    getAll: async () => {
      return authenticatedRequest('/career');
    },

    create: async (careerItem) => {
      const response = await fetch(`${API_BASE_URL}/career`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(careerItem),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar item de carreira');
      }

      return response.json();
    },

    update: async (id, careerItem) => {
      const response = await fetch(`${API_BASE_URL}/career/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(careerItem),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar item de carreira');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/career/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar item de carreira');
      }

      return true;
    },
  },

  // Calendar API
  calendar: {
    getAll: async () => {
      return authenticatedRequest('/calendar');
    },

    create: async (event) => {
      const response = await fetch(`${API_BASE_URL}/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar evento');
      }

      return response.json();
    },

    update: async (id, event) => {
      const response = await fetch(`${API_BASE_URL}/calendar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar evento');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/calendar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }

      return true;
    },
  },

  // User API
  user: {
    getProfile: async () => {
      return { id: 1, email: 'teste@planner.com', name: 'Usuário Teste' };
    },

    updateProfile: async (profile) => {
      return profile;
    },
  },
};

export default apiService;
