import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Teste de health check
      const healthResponse = await fetch('https://backend-98owvp080-sobreiras-projects.vercel.app/api/health');
      results.health = healthResponse.ok ? '✅ OK' : '❌ Erro';

      // Teste de login
      const loginResponse = await apiService.login({
        email: 'teste@email.com',
        password: '123456'
      });
      results.login = loginResponse.success ? '✅ OK' : '❌ Erro';

      // Teste de goals
      const goalsResponse = await apiService.getGoals();
      results.goals = goalsResponse.data ? '✅ OK' : '❌ Erro';

      // Teste de finances
      const financesResponse = await apiService.getFinances();
      results.finances = financesResponse.data ? '✅ OK' : '❌ Erro';

    } catch (error) {
      console.error('Erro nos testes:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🧪 Teste da API</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Executar Testes'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Resultados:</h3>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex justify-between">
              <span className="capitalize">{test}:</span>
              <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h4 className="font-semibold mb-2">Status Atual:</h4>
        <ul className="text-sm space-y-1">
          <li>• Backend: Online (Vercel)</li>
          <li>• Banco de dados: Mock (dados temporários)</li>
          <li>• Autenticação: Mock (teste@email.com / 123456)</li>
          <li>• Próximo passo: Implementar banco real</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
