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

module.exports = async (req, res) => {
  console.log('Function called with path:', req.url);
  console.log('Method:', req.method);
  
  const headers = corsHeaders();

  // Lidar com preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Preflight OPTIONS request - returning 204');
    res.writeHead(204, headers);
    res.end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  let body = {};
  
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      body = JSON.parse(await getRequestBody(req));
    } catch (error) {
      console.error('Error parsing body:', error);
    }
  }

  try {
    // Health check
    if (pathname === '/api/server/health') {
      console.log('Health check requested');
      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'OK',
        message: 'Backend funcionando!',
        timestamp: new Date().toISOString(),
        database: 'Vercel Functions',
        environment: 'production'
      }));
      return;
    }

    // Login
    if (pathname === '/api/server/auth/login' && req.method === 'POST') {
      console.log('Login requested');
      const { email, password } = body;

      const user = users.find(u => u.email === email);
      if (!user) {
        res.writeHead(401, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Credenciais inválidas' }));
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.writeHead(401, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Credenciais inválidas' }));
        return;
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        token
      }));
      return;
    }

    // Verificar token para rotas protegidas
    const user = verifyToken(req.headers.authorization);
    if (!user) {
      res.writeHead(401, { ...headers, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Token inválido' }));
      return;
    }

    // GET endpoints
    if (req.method === 'GET') {
      if (pathname === '/api/server/projects') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.projects }));
        return;
      }
      
      if (pathname === '/api/server/goals') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.goals }));
        return;
      }
      
      if (pathname === '/api/server/finances') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.finances }));
        return;
      }
      
      if (pathname === '/api/server/travels') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.travels }));
        return;
      }
      
      if (pathname === '/api/server/career') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.career }));
        return;
      }
      
      if (pathname === '/api/server/calendar') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.calendar }));
        return;
      }
      
      if (pathname === '/api/server/financial-planning') {
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.financialPlanning }));
        return;
      }
    }

    // POST endpoints
    if (req.method === 'POST') {
      if (pathname === '/api/server/projects') {
        const newProject = { ...body, id: Date.now() };
        mockData.projects.push(newProject);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newProject }));
        return;
      }
      
      if (pathname === '/api/server/goals') {
        const newGoal = { ...body, id: Date.now() };
        mockData.goals.push(newGoal);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newGoal }));
        return;
      }
      
      if (pathname === '/api/server/finances') {
        const newFinance = { ...body, id: Date.now() };
        mockData.finances.push(newFinance);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newFinance }));
        return;
      }
      
      if (pathname === '/api/server/travels') {
        const newTravel = { ...body, id: Date.now() };
        mockData.travels.push(newTravel);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newTravel }));
        return;
      }
      
      if (pathname === '/api/server/calendar') {
        const newEvent = { ...body, id: Date.now() };
        mockData.calendar.push(newEvent);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newEvent }));
        return;
      }
      
      if (pathname === '/api/server/financial-planning') {
        const newPlanning = { ...body, id: Date.now() };
        mockData.financialPlanning.push(newPlanning);
        res.writeHead(201, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: newPlanning }));
        return;
      }
    }

    // PUT endpoints
    if (req.method === 'PUT') {
      if (pathname === '/api/server/career') {
        mockData.career = { ...mockData.career, ...body };
        res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: mockData.career }));
        return;
      }
    }

    // 404 para rotas não encontradas
    res.writeHead(404, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found', path: pathname }));

  } catch (error) {
    console.error('Erro:', error);
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
};

// Função auxiliar para ler o body da requisição
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}
