// API Service for Planner Pro
// Centralized API calls to backend

// BACKEND URL - URL FIXA QUE NUNCA MUDA
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-clean-steel.vercel.app';
const API_PREFIX = '/api';

// Token management
const getToken = () => {
  return localStorage.getItem('token') || '';
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
    console.log('🔑 Token enviado:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Nenhum token encontrado');
  }

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${url}`, config);
  
  // Tenta ler JSON; se não for JSON, mantém vazio
  let payload = {};
  try { 
    payload = await response.json(); 
  } catch {}

  if (response.status === 401 || response.status === 403) {
    // token ausente/ruim → força logout/novo login
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    throw new Error(payload?.error || 'Não autorizado');
  }
  
  if (!response.ok) {
    throw new Error(payload?.error || response.statusText);
  }
  
  return payload;
};

// API Objects
export const apiService = {
  setToken,
  getToken,
  
  // Auth API
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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

  // Projects API - PERSISTENTE (como Trello)
  projects: {
    getAll: async () => {
      return authenticatedRequest('/projects');
    },

    create: async (project) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar projeto parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/projects/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },

  // Goals API
  goals: {
    getAll: async () => {
      return authenticatedRequest('/goals');
    },

    create: async (goal) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar meta parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },

  // Finances API
  finances: {
    getAll: async () => {
      return authenticatedRequest('/finances');
    },

    create: async (finance) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/finances`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/finances/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/finances/${id}`, {
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

  // Career API (substituindo Financial Planning)
  career: {
    getAll: async () => {
      return authenticatedRequest('/career');
    },

    create: async (careerItem) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/career`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/career/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/career/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/career/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar item de carreira parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/career/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },

  // Travels API
  travels: {
    getAll: async () => {
      return authenticatedRequest('/travels');
    },

    create: async (travel) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/travels`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/travels/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/travels/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/travels/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar viagem parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/travels/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },



  // Calendar API
  calendar: {
    getAll: async () => {
      return authenticatedRequest('/calendar');
    },

    create: async (event) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/calendar`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/calendar/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/calendar/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/calendar/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar evento parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/calendar/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },

  // Financial Planning API
  financialPlanning: {
    getAll: async () => {
      return authenticatedRequest('/financial-planning');
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/financial-planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar planejamento financeiro');
      }

      return response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/financial-planning/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar planejamento financeiro');
      }

      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/financial-planning/${id}`, {
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

    patch: async (id, partialData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/financial-planning/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(partialData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar planejamento financeiro parcialmente');
      }

      return response.json();
    },

    exists: async (id) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/financial-planning/${id}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      return response.ok;
    },
  },

  // Import API
  import: {
    travels: async (travelData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/import/travels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify({ travelData }),
      });

      if (!response.ok) {
        throw new Error('Erro ao importar planilha de viagens');
      }

      return response.json();
    },

    finances: async (financeData) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/import/finances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify({ financeData }),
      });

      if (!response.ok) {
        throw new Error('Erro ao importar planilha financeira');
      }

      return response.json();
    },
  },

  // User API
  user: {
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar perfil do usuário');
      }

      return response.json();
    },

    updateProfile: async (profile) => {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil do usuário');
      }

      return response.json();
    },
  },
};

export default apiService;
