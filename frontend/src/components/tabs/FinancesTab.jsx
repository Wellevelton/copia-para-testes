import React, { useState } from 'react';
import { Plus, Import, Save, DollarSign, TrendingUp, AlertCircle, Edit, Target, Zap, Globe, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import NewTransactionModal from '../modals/NewTransactionModal';

const FinancesTab = ({ 
  activeSubTab, 
  setActiveSubTab, 
  finances, 
  setFinances,
  budget, 
  setBudget, 
  editingBudget, 
  setEditingBudget, 
  planilhaFinanceira 
}) => {
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Funções para cálculos automáticos dos cards
  const getFinalGoal = () => {
    if (!planilhaFinanceira || planilhaFinanceira.length === 0) return 0;
    const lastMonth = planilhaFinanceira[planilhaFinanceira.length - 1];
    return lastMonth.saldoAcum || 0;
  };

  const getMaxIncome = () => {
    if (!planilhaFinanceira || planilhaFinanceira.length === 0) return 0;
    const maxIncome = Math.max(...planilhaFinanceira.map(item => item.rendaTotal || 0));
    return maxIncome;
  };

  const getMaxIncomeMonth = () => {
    if (!planilhaFinanceira || planilhaFinanceira.length === 0) return '';
    const maxIncome = Math.max(...planilhaFinanceira.map(item => item.rendaTotal || 0));
    const maxMonth = planilhaFinanceira.find(item => item.rendaTotal === maxIncome);
    return maxMonth ? maxMonth.mes : '';
  };

  const getGrowthPercentage = () => {
    if (!planilhaFinanceira || planilhaFinanceira.length < 2) return 0;
    const firstIncome = planilhaFinanceira[0].rendaTotal || 0;
    const lastIncome = planilhaFinanceira[planilhaFinanceira.length - 1].rendaTotal || 0;
    if (firstIncome === 0) return 0;
    return Math.round(((lastIncome - firstIncome) / firstIncome) * 100);
  };

  const getTravelCount = () => {
    // Contar viagens únicas baseado nos dados de viagens
    // Por enquanto retorna 52 como na imagem, mas pode ser calculado dinamicamente
    return 52;
  };

  // Finance functions
  const getTotalIncome = () => {
    return finances
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalExpenses = () => {
    return Math.abs(finances
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0));
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const addNewTransaction = (transaction) => {
    setFinances(prev => [...prev, transaction]);
    setShowNewTransactionModal(false);
  };

  const renderTransactions = () => {
    const totalIncome = getTotalIncome();
    const totalExpenses = getTotalExpenses();
    const balance = getBalance();
    
    return (
      <div className="space-y-6">
        {/* Header com botões de ação */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Transações Financeiras</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowNewTransactionModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Nova Transação
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Receitas</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-green-200 text-xs mt-1">↗ +12% este mês</p>
              </div>
              <div className="bg-green-500 bg-opacity-30 p-3 rounded-lg">
                <TrendingUp className="text-green-100" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Despesas</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-red-200 text-xs mt-1">↘ -8% este mês</p>
              </div>
              <div className="bg-red-500 bg-opacity-30 p-3 rounded-lg">
                <DollarSign className="text-red-100" size={24} />
              </div>
            </div>
          </div>
          
          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-600 to-blue-800' : 'from-orange-600 to-orange-800'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${balance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium`}>Saldo</p>
                <p className="text-white text-2xl font-bold">
                  {formatCurrency(balance)}
                </p>
                <p className={`${balance >= 0 ? 'text-blue-200' : 'text-orange-200'} text-xs mt-1`}>
                  {balance >= 0 ? '✅ Saldo positivo' : '⚠ Atenção ao saldo'}
                </p>
              </div>
              <div className={`${balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} bg-opacity-30 p-3 rounded-lg`}>
                <AlertCircle className={`${balance >= 0 ? 'text-blue-100' : 'text-orange-100'}`} size={24} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions List */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-white font-semibold mb-4 text-lg">Transações Recentes</h3>
          <div className="space-y-4">
            {finances.slice(-10).reverse().map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '↗' : '↘'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-gray-400 text-sm">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBudget = () => {
    const categories = budget.monthly?.categories || {};
    
    // Calcular gastos reais das transações do mês/ano selecionado
    const getActualExpenses = (category) => {
      return finances
        .filter(item => 
          item.type === 'expense' && 
          item.category === category &&
          new Date(item.date).getFullYear() === selectedYear &&
          new Date(item.date).getMonth() + 1 === selectedMonth
        )
        .reduce((sum, item) => sum + Math.abs(item.amount), 0);
    };

    // Obter dados planejados da planilha para o mês/ano selecionado
    const getPlannedData = () => {
      const monthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
      const plannedData = planilhaFinanceira.find(item => item.mes === monthKey);
      return plannedData ? plannedData.gastos : 0;
    };

    // Obter dados planejados por categoria (distribuindo o gasto total)
    const getPlannedDataByCategory = (category) => {
      const totalPlanned = getPlannedData();
      const categoryPercentages = {
        'Educação': 0.15,
        'Viagem': 0.25,
        'Moradia': 0.20,
        'Alimentação': 0.15,
        'Transporte': 0.10,
        'Lazer': 0.05,
        'Saúde': 0.05,
        'Emergência': 0.05
      };
      return totalPlanned * (categoryPercentages[category] || 0.05);
    };
    
    return (
      <div className="space-y-6">
                 <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold text-white">Orçamento</h2>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <label className="text-gray-300 text-sm font-medium">Mês:</label>
               <select
                 value={selectedMonth}
                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                 className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
               >
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                   <option key={month} value={month}>
                     {new Date(2024, month - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                   </option>
                 ))}
               </select>
             </div>
             <div className="flex items-center gap-2">
               <label className="text-gray-300 text-sm font-medium">Ano:</label>
               <select
                 value={selectedYear}
                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                 className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
               >
                 {[2026, 2027, 2028].map(year => (
                   <option key={year} value={year}>{year}</option>
                 ))}
               </select>
             </div>
           </div>
         </div>
        
                          {/* Resumo Geral */}
         <div className="mb-6">
           <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
             <h3 className="text-white font-semibold text-lg mb-4">Resumo Geral</h3>
             <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-gray-400">Gasto Real:</span>
                 <span className="text-red-400 font-semibold">
                   {formatCurrency(finances
                     .filter(item => 
                       item.type === 'expense' &&
                       new Date(item.date).getFullYear() === selectedYear &&
                       new Date(item.date).getMonth() + 1 === selectedMonth
                     )
                     .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                   )}
                 </span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-gray-400">Planejado:</span>
                 <span className="text-blue-400 font-semibold">
                   {formatCurrency(getPlannedData())}
                 </span>
               </div>
               <div className="text-xs text-gray-500 mt-2">
                 <p>💡 Gasto Real: Baseado nas transações registradas</p>
                 <p>📊 Planejado: Baseado na planilha financeira</p>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-3">
                 <div 
                   className={`h-3 rounded-full transition-all ${
                     finances
                       .filter(item => 
                         item.type === 'expense' &&
                         new Date(item.date).getFullYear() === selectedYear &&
                         new Date(item.date).getMonth() + 1 === selectedMonth
                       )
                       .reduce((sum, item) => sum + Math.abs(item.amount), 0) > getPlannedData() 
                       ? 'bg-gradient-to-r from-red-500 to-red-600' 
                       : 'bg-gradient-to-r from-green-500 to-green-600'
                   }`}
                   style={{ 
                     width: `${Math.min((finances
                       .filter(item => 
                         item.type === 'expense' &&
                         new Date(item.date).getFullYear() === selectedYear &&
                         new Date(item.date).getMonth() + 1 === selectedMonth
                       )
                       .reduce((sum, item) => sum + Math.abs(item.amount), 0) / getPlannedData()) * 100, 100)}%` 
                   }}
                 ></div>
               </div>
             </div>
           </div>
         </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Object.entries(categories).map(([category, data]) => {
             const actual = getActualExpenses(category);
             const planned = getPlannedDataByCategory(category);
             const percentage = planned > 0 ? (actual / planned) * 100 : 0;
             const isOverBudget = actual > planned;
            
            return (
              <div key={category} className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">{category}</h3>
                  {editingBudget && (
                    <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gasto:</span>
                    <span className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                      {formatCurrency(actual)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Planejado:</span>
                    <span className="text-gray-300 font-medium">{formatCurrency(planned)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{percentage.toFixed(0)}% usado</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(planned - actual)} restante
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlanning = () => {
    if (!planilhaFinanceira || planilhaFinanceira.length === 0) {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Planejamento Financeiro</h2>
          </div>
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h3 className="text-white text-xl mb-4">Nenhum dado de planejamento encontrado</h3>
            <p className="text-gray-400">Importe sua planilha financeira para ver as projeções</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Planejamento Financeiro</h2>
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Meta Final 2028</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(getFinalGoal())}
                </p>
                <p className="text-blue-200 text-xs mt-1">Saldo Acumulado</p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 p-3 rounded-lg">
                <Target className="text-blue-100" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Renda Máxima</p>
                <p className="text-white text-xl font-bold">
                  {formatCurrency(getMaxIncome())}
                </p>
                <p className="text-green-200 text-xs mt-1">
                  {getMaxIncomeMonth() ? getMaxIncomeMonth().split('-').reverse().join('/') : 'N/A'}
                </p>
              </div>
              <div className="bg-green-500 bg-opacity-30 p-3 rounded-lg">
                <TrendingUp className="text-green-100" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Crescimento</p>
                <p className="text-white text-xl font-bold">{getGrowthPercentage()}%</p>
                <p className="text-purple-200 text-xs mt-1">Renda vs Inicial</p>
              </div>
              <div className="bg-purple-500 bg-opacity-30 p-3 rounded-lg">
                <Zap className="text-purple-100" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Viagens Plan.</p>
                <p className="text-white text-xl font-bold">{getTravelCount()}</p>
                <p className="text-orange-200 text-xs mt-1">Destinos únicos</p>
              </div>
              <div className="bg-orange-500 bg-opacity-30 p-3 rounded-lg">
                <Globe className="text-orange-100" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Projeção Financeira */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-xl flex items-center gap-3">
              <DollarSign className="text-green-400" size={24} />
              Projeção Financeira
            </h3>
            <div className="flex items-center gap-3">
              <label className="text-gray-300 text-sm font-medium">Ano:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
              >
                {[2026, 2027, 2028].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 pb-3">Mês</th>
                  <th className="text-right text-gray-400 pb-3">Renda Dev</th>
                  <th className="text-right text-gray-400 pb-3">Renda Contab</th>
                  <th className="text-right text-gray-400 pb-3">Freelas</th>
                  <th className="text-right text-gray-400 pb-3">Total</th>
                  <th className="text-right text-gray-400 pb-3">Gastos</th>
                  <th className="text-right text-gray-400 pb-3">Aporte</th>
                  <th className="text-right text-gray-400 pb-3">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {planilhaFinanceira
                  .filter(item => parseInt(item.mes.split('-')[0]) === selectedYear)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                      <td className="py-3 text-white font-medium">{item.mes}</td>
                      <td className="py-3 text-right text-gray-300">R$ {Number(item.rendaDev).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-gray-300">R$ {Number(item.rendaContab).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-blue-400">R$ {Number(item.freelas).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-green-400 font-semibold">R$ {Number(item.rendaTotal).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-red-400">R$ {Number(item.gastos).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-purple-400">R$ {Number(item.aporte).toLocaleString('pt-BR')}</td>
                      <td className="py-3 text-right text-yellow-400 font-bold">R$ {Number(item.saldoAcum).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['transactions', 'budget', 'planning'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'transactions' ? '💰 Transações' : tab === 'budget' ? '📊 Orçamento' : '📈 Planejamento'}
          </button>
        ))}
      </div>
      {activeSubTab === 'transactions' ? renderTransactions() : 
       activeSubTab === 'budget' ? renderBudget() : renderPlanning()}

      {/* Modal Nova Transação */}
      {showNewTransactionModal && (
        <NewTransactionModal 
          isOpen={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
          onSave={addNewTransaction}
        />
      )}
    </div>
  );
};

export default FinancesTab;


