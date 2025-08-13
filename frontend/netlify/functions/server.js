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

// Função para configurar CORS
const corsHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  };
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
    if (path === '/.netlify/functions/server/health') {
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
    if (path === '/.netlify/functions/server/auth/login' && event.httpMethod === 'POST') {
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

    // Verificar token para rotas protegidas
    const user = verifyToken(event.headers.authorization);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token inválido' })
      };
    }

    // GET endpoints
    if (event.httpMethod === 'GET') {
      if (path === '/.netlify/functions/server/projects') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.projects })
        };
      }
      
      if (path === '/.netlify/functions/server/goals') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.goals })
        };
      }
      
      if (path === '/.netlify/functions/server/finances') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.finances })
        };
      }
      
      if (path === '/.netlify/functions/server/travels') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.travels })
        };
      }
      
      if (path === '/.netlify/functions/server/career') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.career })
        };
      }
      
      if (path === '/.netlify/functions/server/calendar') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.calendar })
        };
      }
      
      if (path === '/.netlify/functions/server/financial-planning') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.financialPlanning })
        };
      }
    }

    // POST endpoints
    if (event.httpMethod === 'POST') {
      if (path === '/.netlify/functions/server/projects') {
        const newProject = { ...body, id: Date.now() };
        mockData.projects.push(newProject);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newProject })
        };
      }
      
      if (path === '/.netlify/functions/server/goals') {
        const newGoal = { ...body, id: Date.now() };
        mockData.goals.push(newGoal);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newGoal })
        };
      }
      
      if (path === '/.netlify/functions/server/finances') {
        const newFinance = { ...body, id: Date.now() };
        mockData.finances.push(newFinance);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newFinance })
        };
      }
      
      if (path === '/.netlify/functions/server/travels') {
        const newTravel = { ...body, id: Date.now() };
        mockData.travels.push(newTravel);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newTravel })
        };
      }
      
      if (path === '/.netlify/functions/server/calendar') {
        const newEvent = { ...body, id: Date.now() };
        mockData.calendar.push(newEvent);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ data: newEvent })
        };
      }
      
      if (path === '/.netlify/functions/server/financial-planning') {
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
      if (path === '/.netlify/functions/server/career') {
        mockData.career = { ...mockData.career, ...body };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: mockData.career })
        };
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
