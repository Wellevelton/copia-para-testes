import React, { useState } from 'react';
import { Settings, Import, FileText, Upload, Bell, Moon, Sun, Palette, Globe, Shield } from 'lucide-react';

const SettingsTab = ({ setViagensDataState, setFinances, setPlanilhaFinanceiraState, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('travels');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = e.target.result;
        console.log('Raw CSV data:', csvData.substring(0, 500)); // Debug: mostrar primeiros 500 caracteres
        
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        console.log('Number of lines:', lines.length); // Debug
        
        if (lines.length < 2) {
          alert('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados.');
          return;
        }

        // Detectar o separador (vírgula ou ponto e vírgula)
        const firstLine = lines[0];
        const hasSemicolon = firstLine.includes(';');
        const separator = hasSemicolon ? ';' : ',';
        console.log('Detected separator:', separator); // Debug
        
        const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
        console.log('Headers found:', headers); // Debug
        
        const data = lines.slice(1).map((line, lineIndex) => {
          // Melhor parsing para lidar com separadores dentro de aspas
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === separator && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Último valor
          
          const obj = {};
          headers.forEach((header, index) => {
            let value = values[index] || '';
            // Remover aspas extras
            value = value.replace(/^"|"$/g, '');
            obj[header] = value;
          });
          
          console.log(`Line ${lineIndex + 1}:`, obj); // Debug
          return obj;
        });

        console.log('Processed data:', data); // Debug

                 if (importType === 'travels') {
           // Processar dados de viagens baseado na planilha real
           const travelData = data.map((row, index) => {
             // Debug: mostrar todas as chaves disponíveis
             console.log(`Row ${index + 1} keys:`, Object.keys(row));
             console.log(`Row ${index + 1} values:`, row);
             
                           // Função para extrair valor numérico de strings como "R$ 1.000"
              const extractNumber = (value) => {
                if (!value) return 0;
                const numStr = value.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
                return parseFloat(numStr) || 0;
              };

              const travel = {
                id: index + 1,
                semana: parseInt(row.Semana || 0),
                inicio: row.Início || '',
                fim: row.Fim || '',
                cidade: row.Cidade || '',
                pais: row.País || '',
                zona: row.Zona || '',
                hospedagem: extractNumber(row.Hospedagem_base || row.Hospedagem),
                alimentacao: extractNumber(row.Alimentação_base || row.Alimentação),
                transporte: extractNumber(row.Transporte_base || row.Transporte),
                academia: extractNumber(row.Academia_base || row.Academia),
                suplementos: extractNumber(row.Suplementos_base || row.Suplementos),
                atividades: extractNumber(row.Atividades_base || row.Atividades),
                subtotal: extractNumber(row.Subtotal_base || row.Subtotal),
                subtotal_alto: extractNumber(row.Subtotal_alto || 0),
                fator_extrapolado: parseFloat(row.Fator_extrapolado || 0),
                notas: row.Notas || '',
                seguro_base: extractNumber(row.Seguro_base || 0),
                telefone_base: extractNumber(row.Telefone_base || 0),
                vistos_base: extractNumber(row.Vistos_base || 0),
                seguro_alto: extractNumber(row.Seguro_alto || 0),
                telefone_alto: extractNumber(row.Telefone_alto || 0),
                vistos_alto: extractNumber(row.Vistos_alto || 0),
                voos_longos: extractNumber(row.Voos_longos || 0),
                total: extractNumber(row.Total_base || row.Total || 0),
                total_alto: extractNumber(row.Total_alto || 0),
                buffer_base: extractNumber(row.Buffer8_base || row.Buffer_base || 0),
                buffer_alto: extractNumber(row.Buffer8_alto || row.Buffer_alto || 0),
                total_base_c_buffer: extractNumber(row.Total_base_c_buffer || 0),
                total_alto_c_buffer: extractNumber(row.Total_alto_c_buffer || 0),
                bloco: row.Bloco || '',
                dias_semana: parseInt(row.Dias_semana || 0),
                dias_schengen: parseInt(row.Dias_Schengen || 0)
              };
             
             console.log(`Travel ${index + 1}:`, travel); // Debug
             return travel;
           });
          
          console.log('Final travel data:', travelData); // Debug
          setViagensDataState(travelData);
                 } else {
           // Processar dados financeiros da planilha de planejamento
           const financeData = data.map((row, index) => {
             // Função para extrair valor numérico de strings como "R$ 1.000"
             const extractNumber = (value) => {
               if (!value) return 0;
               const numStr = value.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
               return parseFloat(numStr) || 0;
             };



             return {
               mes: row['Ms'] || row.Mês || row.mes || row.Mes || '',
               rendaDev: extractNumber(row['Renda Dev'] || row.rendaDev || row.RendaDev),
               rendaContab: extractNumber(row['Renda Contab'] || row.rendaContab || row.RendaContab),
               freelas: extractNumber(row.Freelas || row.freelas),
               rendaTotal: extractNumber(row['Renda Total'] || row.rendaTotal || row.RendaTotal),
               gastos: extractNumber(row.Gastos || row.gastos),
               aporte: extractNumber(row.Aporte || row.aporte),
               saldoAcum: extractNumber(row['Saldo Acum.'] || row.saldoAcum || row.SaldoAcum)
             };
           });
           

           setPlanilhaFinanceiraState(financeData);
         }

        alert(`${importType === 'travels' ? 'Viagens' : 'Transações financeiras'} importadas com sucesso!`);
        setSelectedFile(null);
      } catch (error) {
        console.error('Import error:', error); // Debug
        alert('Erro ao processar arquivo CSV. Verifique o formato.');
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl">
            <Settings className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Configurações</h2>
            <p className="text-gray-400">Personalize sua experiência</p>
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar
          </button>
        )}
      </div>

      {/* Importação de Dados */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-white font-semibold mb-6 text-xl flex items-center gap-3">
          <Import className="text-blue-400" size={24} />
          Importação de Dados
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Tipo de Importação</label>
            <select 
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="travels">Planilha de Viagens</option>
              <option value="finances">Planilha Financeira</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Selecionar Arquivo CSV</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              <button
                onClick={handleImport}
                disabled={!selectedFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload size={20} />
                Importar
              </button>
            </div>
            {selectedFile && (
              <p className="text-green-400 text-sm mt-2">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

                     <div className="bg-gray-700 rounded-lg p-4">
             <h4 className="text-white font-medium mb-2">Formato esperado para CSV:</h4>
             <div className="text-gray-400 text-sm space-y-1">
               {importType === 'travels' ? (
                 <>
                   <p>• <strong>Planilha de Viagens:</strong> Semana, Início, Fim, Cidade, País, Zona, Hospedagem, Alimentação, Transporte, Academia, Suplementos, Atividades, Subtotal, Fator_extrapolado, Notas, Seguro_base, Telefone_base, Vistos_base, Seguro_alto, Telefone_alto, Vistos_alto, Voos_longos, Total, Subtotal_extrapolado, Buffer_base, Buffer_alto, Total_base_c_buffer, Total_alto_c_buffer, Bloco, Dias_semana, Dias_Schengen, Stay_28d_recommended, Monthly_rate_sim_RS, Monthly_savings_vs_4w_RS</p>
                   <p>• <strong>Exemplo:</strong> "1, 2024-01-01, 2024-01-07, Berlim, Alemanha, Schengen, 500, 300, 200, 50, 30, 100, 1180, 1.2, Notas da viagem, 100, 50, 0, 150, 75, 0, 500, 1416, 100, 200, 1516, 1616, Bloco A, 7, 7, Sim, 2000, 500"</p>
                 </>
                               ) : (
                  <>
                    <p>• <strong>Planilha Financeira:</strong> Mês, Renda Dev, Renda Contab, Freelas, Renda Total, Gastos, Aporte, Saldo Acum.</p>
                    <p>• <strong>Exemplo:</strong> "2026-01, 3500, 2500, 500, 6500, 2500, 4000, 4000"</p>
                  </>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Preferências do Usuário */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-white font-semibold mb-6 text-xl flex items-center gap-3">
          <Settings className="text-purple-400" size={24} />
          Preferências do Usuário
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notificações */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Bell className="text-blue-400" size={20} />
              Notificações
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Notificações de metas</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Lembretes de viagens</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Alertas financeiros</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Resumo semanal</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
            </div>
          </div>

          {/* Aparência */}
          <div className="space-y-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Palette className="text-purple-400" size={20} />
              Aparência
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Modo escuro</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Animações</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Compacto</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
            </div>
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="mt-8 space-y-4">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Shield className="text-green-400" size={20} />
            Configurações Avançadas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Sincronização automática</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Modo offline</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Backup automático</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </label>
              <label className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">Analytics</span>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Integrações */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-white font-semibold mb-6 text-xl flex items-center gap-3">
          <Globe className="text-blue-400" size={24} />
          Integrações
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">G</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Google Calendar</h4>
                  <p className="text-gray-400 text-sm">Sincronize eventos com seu calendário</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Disponível</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">T</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Trello</h4>
                  <p className="text-gray-400 text-sm">Importe projetos do Trello</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Disponível</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">N</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Notion</h4>
                  <p className="text-gray-400 text-sm">Sincronize dados com Notion</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Em breve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;


