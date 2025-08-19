// Simple health check serverless function
module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://planner-pro-app.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check response
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
};

