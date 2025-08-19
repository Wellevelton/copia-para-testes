// Simple login API in frontend project
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  // Mock user validation 
  if (email === 'teste@planner.com' && password === '123456') {
    const token = jwt.sign(
      { 
        userId: 1, 
        email: email 
      },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: 1,
        email: email
      }
    });
  }

  res.status(401).json({ error: 'Credenciais inválidas' });
}


