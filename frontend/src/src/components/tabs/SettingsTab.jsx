import React, { useState, useEffect } from 'react';
import { Settings, Import, FileText, Upload, Bell, Moon, Sun, Palette, Globe, Shield, Calendar } from 'lucide-react';
import api from '../../services/api';
import { googleAuth, googleCalendar, realtimeCalendar, GOOGLE_CONFIG } from '../../config/google';
import { realtimeSync } from '../../services/realtimeSync.js';

const SettingsTab = ({ setViagensDataState, setFinances, setPlanilhaFinanceiraState, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('travels');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Setup real-time listeners
  useEffect(() => {
    const handleRealtimeUpdate = (data) => {
      console.log('🔔 Atualização em tempo real:', data);
      
      switch (data.type) {
        case 'connected':
          console.log('✅ Conectado ao tempo real!');
          break;
        case 'auth_success':
          setGoogleConnected(true);
          setGoogleLoading(false);
          break;
        case 'sync_complete':
          setCalendarEvents(data.events);
          console.log(`✅ ${data.count} eventos sincronizados em tempo real`);
          break;
        case 'event_created':
        case 'event_updated':
        case 'event_deleted':
          // Re-sync calendar when events change
          realtimeCalendar.syncCalendar();
          break;
        case 'external_change':
          console.log('🔔 Calendário alterado externamente!');
          // Show notification to user
          break;
      }
    };

    realtimeCalendar.onUpdate(handleRealtimeUpdate);

    return () => {
      realtimeCalendar.offUpdate(handleRealtimeUpdate);
    };
  }, []);

  // Verificar se Google está conectado
  useEffect(() => {
    const checkGoogleConnection = () => {
      try {
        const isConnected = googleAuth.isSignedIn();
        setGoogleConnected(isConnected);
      } catch (error) {
        console.error('Erro ao verificar conexão Google:', error);
        setGoogleConnected(false);
      }
    };

    // Verificar a cada 5 segundos
    const interval = setInterval(checkGoogleConnection, 5000);
    checkGoogleConnection(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
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
           console.log('CSV Data:', data); // Debug completo
           
           const financeData = data.map((row, index) => {
             console.log(`Processing row ${index + 1}:`, row); // Debug detalhado
             
             // Função para extrair valor numérico (mantém ponto decimal)
             const extractNumber = (value) => {
               if (!value) return 0;
               // Remover apenas caracteres não numéricos exceto ponto e vírgula
               const numStr = value.toString().replace(/[^\d.,-]/g, '').replace(',', '.');
               const result = parseFloat(numStr) || 0;
               console.log(`Extracted ${value} -> ${result}`);
               return result;
             };

             // Debug: mostrar todas as chaves disponíveis
             console.log(`Row ${index + 1} keys:`, Object.keys(row));
             console.log(`Row ${index + 1} values:`, row);
             
             // Suportar dois formatos de planilha:
             // 1. Mês com acento (ex: 2026-01)
             // 2. ano e Mes separados (ex: ano=2026, Mes=1)
             
             let mesFormatado = '';
             
             // Formato 1: Mês já contém ano-mês (ex: 2026-01)
             const mesCompleto = row['Mês'] || row.mes || row.Mês || row['Ms'] || '';
             
             if (mesCompleto && /^\d{4}-\d{2}$/.test(mesCompleto)) {
               mesFormatado = mesCompleto;
             } 
             // Formato 2: ano e Mes separados
             else if (row.ano && row.Mes) {
               const ano = row.ano;
               const mes = String(row.Mes).padStart(2, '0');
               mesFormatado = `${ano}-${mes}`;
             }
             // Formato 2 alternativo: ano e mes (minúsculo)
             else if (row.ano && row.mes) {
               const ano = row.ano;
               const mes = String(row.mes).padStart(2, '0');
               mesFormatado = `${ano}-${mes}`;
             }
             
             if (!mesFormatado) {
               console.log(`Skipping row ${index + 1}: cannot parse date. Available keys:`, Object.keys(row));
               console.log(`Row values:`, row);
               return null;
             }

             const financeItem = {
               mes: mesFormatado,
               rendaDev: extractNumber(row['Renda Dev'] || row['RendaDev'] || row.rendaDev || row.RendaDev || 0),
               rendaContab: extractNumber(row['Renda Contab'] || row['RendaContab'] || row.rendaContab || row.RendaContab || 0),
               freelas: extractNumber(row.Freelas || row.freelas || 0),
               rendaTotal: extractNumber(row['Renda Total'] || row['RendaTotal'] || row.rendaTotal || row.RendaTotal || 0),
               gastos: extractNumber(row.Gastos || row.gastos || 0),
               aporte: extractNumber(row.Aporte || row.aporte || 0),
               saldoAcum: extractNumber(row['Saldo Acum.'] || row['Saldo Acum'] || row['SaldoAcum'] || row.saldoAcum || 0)
             };

             console.log(`Created finance item ${index + 1}:`, financeItem);
             return financeItem;
           }).filter(item => item !== null); // Filtrar itens nulos
           
           console.log('Final finance data:', financeData); // Debug
           
           // Salvar dados localmente por enquanto
           console.log('Dados processados com sucesso!');
           setPlanilhaFinanceiraState(financeData);
           
           // TODO: Implementar salvamento no backend posteriormente
           // try {
           //   await Promise.all(financeData.map(item => api.financialPlanning.create(item)));
           //   console.log('Dados salvos no backend com sucesso!');
           // } catch (error) {
           //   console.error('Erro ao salvar no backend:', error);
           // }
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

  // Função para conectar com Google Calendar
  const handleGoogleCalendarConnect = async () => {
    setGoogleLoading(true);
    
    try {
      console.log('🔄 Conectando com Google Calendar...');
      
      // Inicializar Google Auth se necessário
      if (!window.google) {
        await googleAuth.init();
      }
      
      // Fazer login com Google
      const user = await googleAuth.signIn();
      console.log('✅ Login Google realizado:', user);
      
      // Testar conexão listando eventos dos próximos 30 dias
      const events = await googleCalendar.listEvents();
      console.log('📅 Eventos recebidos:', events);
      
      if (events && events.items) {
        setCalendarEvents(events.items);
        console.log(`✅ ${events.items.length} eventos carregados`);
      }
      
      setGoogleConnected(true);
      alert(`Google Calendar conectado com sucesso! ${events?.items?.length || 0} eventos encontrados.`);
      
    } catch (error) {
      console.error('❌ Erro ao conectar Google Calendar:', error);
      alert('Erro ao conectar com Google Calendar: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Função para sincronizar eventos do Planner Pro com Google Calendar
  const syncEventsToGoogleCalendar = async () => {
    if (!googleConnected) {
      alert('Conecte-se ao Google Calendar primeiro!');
      return;
    }

    setGoogleLoading(true);
    
    try {
      console.log('🔄 Sincronizando eventos com Google Calendar...');
      
      // Criar eventos de exemplo do Planner Pro
      const hoje = new Date();
      const plannerEvents = [
        {
          summary: '🎯 Revisão Semanal de Metas',
          description: 'Revisar progresso das metas semanais e ajustar planos se necessário.\n\nCriado pelo Planner Pro.',
          start: {
            dateTime: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Próxima semana
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hora
            timeZone: 'America/Sao_Paulo'
          }
        },
        {
          summary: '💰 Planejamento Financeiro Mensal',
          description: 'Análise das finanças do mês e planejamento para o próximo período.\n\nCriado pelo Planner Pro.',
          start: {
            dateTime: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Próximo mês
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 horas
            timeZone: 'America/Sao_Paulo'
          }
        },
        {
          summary: '📊 Relatório de Progresso',
          description: 'Gerar relatórios de progresso dos projetos e metas.\n\nCriado pelo Planner Pro.',
          start: {
            dateTime: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Em 2 semanas
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // +30 min
            timeZone: 'America/Sao_Paulo'
          }
        }
      ];

      // Criar eventos no Google Calendar
      let eventosCriados = 0;
      for (const event of plannerEvents) {
        try {
          const resultado = await googleCalendar.createEvent('primary', event);
          console.log('✅ Evento criado:', resultado);
          eventosCriados++;
        } catch (error) {
          console.warn('⚠️ Erro ao criar evento:', event.summary, error);
        }
      }

      alert(`✅ ${eventosCriados} de ${plannerEvents.length} eventos sincronizados com Google Calendar!`);
      
      // Recarregar eventos para mostrar os novos
      const events = await googleCalendar.listEvents();
      if (events && events.items) {
        setCalendarEvents(events.items);
      }
      
    } catch (error) {
      console.error('❌ Erro ao sincronizar eventos:', error);
      alert('Erro ao sincronizar eventos com Google Calendar: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
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
                   <p>• <strong>Planilha Financeira:</strong> ano, Mês, Renda Dev, Renda Contab, Freelas, Renda Total, Gastos, Aporte, Saldo Acum.</p>
                   <p>• <strong>Exemplo:</strong> "2026, 1, 3500, 2500, 500, 6500, 2500, 4000, 4000"</p>
                   <p>• <strong>Formato CSV:</strong> Primeira linha deve conter os cabeçalhos: ano, Mês, Renda Dev, Renda Contab, Freelas, Renda Total, Gastos, Aporte, Saldo Acum.</p>
                   <p>• <strong>Nota:</strong> O campo "Mês" deve ser um número de 1 a 12, o sistema irá converter automaticamente para o formato correto.</p>
                 </>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Integração Google Calendar */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-white font-semibold mb-6 text-xl flex items-center gap-3">
          <Calendar className="text-green-400" size={24} />
          Integração Google Calendar
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Status da Conexão</h4>
              <p className="text-gray-400 text-sm">
                {googleConnected ? 'Conectado ao Google Calendar' : 'Não conectado'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${googleConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {googleConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGoogleCalendarConnect}
              disabled={googleLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar size={20} />
              {googleLoading ? 'Conectando...' : googleConnected ? 'Reconectar' : 'Conectar Google Calendar'}
            </button>
            
            {googleConnected && (
              <button
                onClick={syncEventsToGoogleCalendar}
                disabled={googleLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Upload size={20} />
                {googleLoading ? 'Sincronizando...' : 'Sincronizar Eventos'}
              </button>
            )}
          </div>

          {calendarEvents.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Eventos do Google Calendar</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {calendarEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="bg-gray-600 p-3 rounded-lg">
                    <h5 className="text-white font-medium">{event.summary}</h5>
                    <p className="text-gray-300 text-sm">
                      {new Date(event.start?.dateTime || event.start?.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
              {calendarEvents.length > 5 && (
                <p className="text-gray-400 text-sm mt-2">
                  Mostrando 5 de {calendarEvents.length} eventos
                </p>
              )}
            </div>
          )}
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
                {googleConnected && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
                <button 
                  onClick={handleGoogleCalendarConnect}
                  disabled={googleLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {googleLoading ? 'Conectando...' : googleConnected ? 'Reconectar' : 'Conectar'}
                </button>
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


