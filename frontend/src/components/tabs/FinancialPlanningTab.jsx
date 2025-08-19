import React, { useState, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import api from '../../services/api';

const FinancialPlanningTab = ({ planilhaFinanceiraState, setPlanilhaFinanceiraState }) => {
  const [showImportModal, setShowImportModal] = useState(false);

  const [editingRow, setEditingRow] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentYear, setCurrentYear] = useState(2026);
  const [filteredData, setFilteredData] = useState([]);

  // Função para calcular valores automaticamente
  const calculateValues = (row) => {
    const rendaTotal = (row.rendaDev || 0) + (row.rendaContab || 0) + (row.freelas || 0);
    const gastos = (row.rendaTotal || rendaTotal) * 0.385; // 38.5% dos gastos
    const aporte = (row.rendaTotal || rendaTotal) - gastos;
    
    return {
      ...row,
      rendaTotal,
      gastos: Math.round(gastos * 100) / 100,
      aporte: Math.round(aporte * 100) / 100
    };
  };

  // Função para calcular saldo acumulado
  const calculateSaldoAcum = (data) => {
    let saldoAcum = 0;
    return data.map((row, index) => {
      saldoAcum += row.aporte || 0;
      return {
        ...row,
        saldoAcum: Math.round(saldoAcum * 100) / 100
      };
    });
  };

  // Atualizar dados quando mudar
  useEffect(() => {
    if (planilhaFinanceiraState.length > 0) {
      const updatedData = planilhaFinanceiraState.map(row => calculateValues(row));
      const finalData = calculateSaldoAcum(updatedData);
      setPlanilhaFinanceiraState(finalData);
    }
  }, []);

  // Carregar dados do backend ao montar o componente
  useEffect(() => {
    const loadDataFromBackend = async () => {
      try {
        console.log('🔄 Iniciando carregamento de dados do backend...');
        const startTime = Date.now();
        
        const response = await api.financialPlanning.getAll();
        const endTime = Date.now();
        
        console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
        console.log('Resposta completa do backend:', response);
        
        // O endpoint retorna diretamente o array, não response.data
        if (response && Array.isArray(response)) {
          console.log(`✅ ${response.length} registros carregados do backend`);
          setPlanilhaFinanceiraState(response);
        } else {
          console.log('❌ Resposta inválida do backend:', response);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do backend:', error);
        // Fallback para dados locais
      }
    };

    loadDataFromBackend();
  }, []);

  // Filtrar dados por ano
  useEffect(() => {
    const filtered = planilhaFinanceiraState.filter(row => {
      if (!row.mes) return false;
      
      // Formato esperado: "2026-01", "2026-02", etc.
      const parts = row.mes.split('-');
      const rowYear = parseInt(parts[0]);
      
      console.log(`Filtering: ${row.mes} -> year: ${rowYear}, currentYear: ${currentYear}`);
      return rowYear === currentYear;
    });
    
    console.log(`Filtered data for year ${currentYear}:`, filtered);
    setFilteredData(filtered);
  }, [currentYear, planilhaFinanceiraState]);



  // Função para editar linha
  const startEditing = (index) => {
    setEditingRow(index);
  };

  // Função para salvar edição
  const saveEdit = (index) => {
    const updatedData = [...planilhaFinanceiraState];
    const calculatedRow = calculateValues(updatedData[index]);
    updatedData[index] = calculatedRow;
    
    const finalData = calculateSaldoAcum(updatedData);
    setPlanilhaFinanceiraState(finalData);
    setEditingRow(null);
  };

  // Função para cancelar edição
  const cancelEdit = () => {
    setEditingRow(null);
  };

  // Função para deletar linha
  const deleteRow = (index) => {
    const updatedData = planilhaFinanceiraState.filter((_, i) => i !== index);
    const finalData = calculateSaldoAcum(updatedData);
    setPlanilhaFinanceiraState(finalData);
  };

  // Função para atualizar valor em edição
  const updateEditingValue = (field, value) => {
    if (editingRow !== null) {
      const updatedData = [...planilhaFinanceiraState];
      updatedData[editingRow] = {
        ...updatedData[editingRow],
        [field]: parseFloat(value) || 0
      };
      setPlanilhaFinanceiraState(updatedData);
    }
  };

  // Função para exportar dados
  const exportData = () => {
    const csvContent = [
      'Mês,Renda Dev,Renda Contab,Freelas,Renda Total,Gastos,Aporte,Saldo Acumulado',
      ...planilhaFinanceiraState.map(row => 
        `${row.mes},${row.rendaDev},${row.rendaContab},${row.freelas},${row.rendaTotal},${row.gastos},${row.aporte},${row.saldoAcum}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `planilha_financeira_${currentYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para importar dados
  const importData = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          return {
            mes: values[0] || '',
            rendaDev: parseFloat(values[1]) || 0,
            rendaContab: parseFloat(values[2]) || 0,
            freelas: parseFloat(values[3]) || 0,
            rendaTotal: parseFloat(values[4]) || 0,
            gastos: parseFloat(values[5]) || 0,
            aporte: parseFloat(values[6]) || 0,
            saldoAcum: parseFloat(values[7]) || 0
          };
        });

        const calculatedData = importedData.map(row => calculateValues(row));
        const finalData = calculateSaldoAcum(calculatedData);
        setPlanilhaFinanceiraState(finalData);
        setShowImportModal(false);
        setSelectedFile(null);
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(selectedFile);
  };

  // Função para resetar dados
  const resetData = () => {
    if (confirm('Tem certeza que deseja resetar todos os dados?')) {
      setPlanilhaFinanceiraState([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Planejamento Financeiro
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas receitas, despesas e investimentos
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetData}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>Resetar</span>
          </button>
        </div>
      </div>

      {/* Ano atual */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Ano:
        </label>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {[2024, 2025, 2026, 2027, 2028, 2029].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-gray-800/40 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Renda Dev
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Renda Contab
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Freelas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Renda Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aporte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Saldo Acumulado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/30 divide-y divide-gray-600/50">
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-700/50"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {editingRow === index ? (
                      <input
                        type="text"
                        value={row.mes}
                        onChange={(e) => updateEditingValue('mes', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      row.mes
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingRow === index ? (
                      <input
                        type="number"
                        value={row.rendaDev}
                        onChange={(e) => updateEditingValue('rendaDev', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      `R$ ${row.rendaDev?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingRow === index ? (
                      <input
                        type="number"
                        value={row.rendaContab}
                        onChange={(e) => updateEditingValue('rendaContab', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      `R$ ${row.rendaContab?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {editingRow === index ? (
                      <input
                        type="number"
                        value={row.freelas}
                        onChange={(e) => updateEditingValue('freelas', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      `R$ ${row.freelas?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                    R$ {row.rendaTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    R$ {row.gastos?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                    R$ {row.aporte?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                    R$ {row.saldoAcum?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-2">
                      {editingRow === index ? (
                        <>
                          <button
                            onClick={() => saveEdit(index)}
                            className="text-green-600 hover:text-green-800 dark:hover:text-green-400"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(index)}
                            className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Importar Dados
            </h3>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={importData}
                disabled={!selectedFile}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Importar
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default FinancialPlanningTab;
