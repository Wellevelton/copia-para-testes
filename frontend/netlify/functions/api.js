const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurações
const JWT_SECRET = 'seu-jwt-secret-super-secreto-aqui-2024';

// Usuários mock
const users = [
  {
    id: 1,
    email: 'teste@planner.com',
    name: 'wellevelton silva',
    password: '$2a$12$zX/VeT44KyWMNavz.6031.Km0wXdN1Ct8Yp7gZF2ypVWe3k/6s2Ny' // 123456
  }
];

// Dados mock para as diferentes seções
const mockData = {
  projects: [],
  goals: [],
  finances: [],
  travels: [],
  career: {},
  calendar: [],
  financialPlanning: []
};

// Função para configurar CORS
const corsHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  };
};

// Função para verificar token
const verifyToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

exports.handler = async (event, context) => {
  console.log('Function called with path:', event.path);
  console.log('Method:', event.httpMethod);
  
  const headers = corsHeaders();

  // Lidar com preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Preflight OPTIONS request - returning 204');
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  const { path } = event;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // Health check
    if (path === '/api/health') {
      console.log('Health check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          message: 'Backend funcionando!',
          timestamp: new Date().toISOString(),
          database: 'Netlify Functions',
          environment: 'production'
        })
      };
    }

    // Login
    if (path === '/api/auth/login' && event.httpMethod === 'POST') {
      console.log('Login requested');
      const { email, password } = body;

      const user = users.find(u => u.email === email);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: { id: user.id, email: user.email, name: user.name },
          token
        })
      };
    }

    // Verificar token para rotas protegidas (exceto health check e login)
    if (path !== '/api/health' && path !== '/api/auth/login') {
      const user = verifyToken(event.headers.authorization);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token inválido' })
        };
      }
    }

    // GET endpoints
    if (event.httpMethod === 'GET') {
      if (path === '/api/projects') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.projects })
        };
      }
      
      if (path === '/api/goals') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.goals })
        };
      }
      
      if (path === '/api/finances') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.finances })
        };
      }
      
      if (path === '/api/travels') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.travels })
        };
      }
      
      if (path === '/api/career') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.career })
        };
      }
      
      if (path === '/api/calendar') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.calendar })
        };
      }
      
      if (path === '/api/financial-planning') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.financialPlanning })
        };
      }
    }

    // POST endpoints
    if (event.httpMethod === 'POST') {
      if (path === '/api/projects') {
        const newProject = { ...body, id: Date.now() };
        mockData.projects.push(newProject);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newProject })
        };
      }
      
      if (path === '/api/goals') {
        const newGoal = { ...body, id: Date.now() };
        mockData.goals.push(newGoal);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newGoal })
        };
      }
      
      if (path === '/api/finances') {
        const newFinance = { ...body, id: Date.now() };
        mockData.finances.push(newFinance);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newFinance })
        };
      }
      
      if (path === '/api/travels') {
        const newTravel = { ...body, id: Date.now() };
        mockData.travels.push(newTravel);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newTravel })
        };
      }
      
      if (path === '/api/calendar') {
        const newEvent = { ...body, id: Date.now() };
        mockData.calendar.push(newEvent);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newEvent })
        };
      }
      
      if (path === '/api/financial-planning') {
        const newPlanning = { ...body, id: Date.now() };
        mockData.financialPlanning.push(newPlanning);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newPlanning })
        };
      }
    }

    // PUT endpoints
    if (event.httpMethod === 'PUT') {
      const id = path.split('/').pop();
      
      if (path.startsWith('/api/projects/')) {
        const index = mockData.projects.findIndex(p => p.id == id);
        if (index !== -1) {
          mockData.projects[index] = { ...mockData.projects[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.projects[index] })
          };
        }
      }
      
      if (path.startsWith('/api/goals/')) {
        const index = mockData.goals.findIndex(g => g.id == id);
        if (index !== -1) {
          mockData.goals[index] = { ...mockData.goals[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.goals[index] })
          };
        }
      }
      
      if (path.startsWith('/api/finances/')) {
        const index = mockData.finances.findIndex(f => f.id == id);
        if (index !== -1) {
          mockData.finances[index] = { ...mockData.finances[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.finances[index] })
          };
        }
      }
      
      if (path.startsWith('/api/travels/')) {
        const index = mockData.travels.findIndex(t => t.id == id);
        if (index !== -1) {
          mockData.travels[index] = { ...mockData.travels[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.travels[index] })
          };
        }
      }
      
      if (path.startsWith('/api/calendar/')) {
        const index = mockData.calendar.findIndex(e => e.id == id);
        if (index !== -1) {
          mockData.calendar[index] = { ...mockData.calendar[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.calendar[index] })
          };
        }
      }
      
      if (path.startsWith('/api/financial-planning/')) {
        const index = mockData.financialPlanning.findIndex(p => p.id == id);
        if (index !== -1) {
          mockData.financialPlanning[index] = { ...mockData.financialPlanning[index], ...body };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: mockData.financialPlanning[index] })
          };
        }
      }
      
      if (path === '/api/career') {
        mockData.career = { ...mockData.career, ...body };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.career })
        };
      }
    }

    // DELETE endpoints
    if (event.httpMethod === 'DELETE') {
      const id = path.split('/').pop();
      
      if (path.startsWith('/api/projects/')) {
        const index = mockData.projects.findIndex(p => p.id == id);
        if (index !== -1) {
          mockData.projects.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
      
      if (path.startsWith('/api/goals/')) {
        const index = mockData.goals.findIndex(g => g.id == id);
        if (index !== -1) {
          mockData.goals.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
      
      if (path.startsWith('/api/finances/')) {
        const index = mockData.finances.findIndex(f => f.id == id);
        if (index !== -1) {
          mockData.finances.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
      
      if (path.startsWith('/api/travels/')) {
        const index = mockData.travels.findIndex(t => t.id == id);
        if (index !== -1) {
          mockData.travels.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
      
      if (path.startsWith('/api/calendar/')) {
        const index = mockData.calendar.findIndex(e => e.id == id);
        if (index !== -1) {
          mockData.calendar.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
      
      if (path.startsWith('/api/financial-planning/')) {
        const index = mockData.financialPlanning.findIndex(p => p.id == id);
        if (index !== -1) {
          mockData.financialPlanning.splice(index, 1);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
          };
        }
      }
    }

    // 404 para rotas não encontradas
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found', path })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
