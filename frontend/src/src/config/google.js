// Google OAuth Configuration
import { realtimeSync } from '../services/realtimeSync.js';
export const GOOGLE_CONFIG = {
  // Google OAuth 2.0 Client ID
  CLIENT_ID: '509118090977-mbgabinfll0hd1ug638u8kqora15nekh.apps.googleusercontent.com',
  
  // Scopes necessários
  SCOPES: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' '),
  
  // Discovery docs para Calendar API
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  
  // API Key para Calendar API
  API_KEY: 'AIzaSyCbhkUWZZL6jE8ox4QK6O-2-aQF-d4QZtI'
};

// Google OAuth Helper Functions (usando Google Identity Services)
export const googleAuth = {
  // Inicializar Google API
  init: () => {
    return new Promise((resolve, reject) => {
      console.log('🔄 Inicializando Google OAuth...');
      
      // Connect to real-time sync
      realtimeSync.connect();
      
      // Aguardar o carregamento do Google Identity Services
      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkInterval);
          console.log('✅ Google Identity Services carregado');
          resolve();
        }
      }, 100);
      
      // Timeout após 10 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('❌ Timeout ao carregar Google Identity Services');
        reject(new Error('Timeout ao carregar Google Identity Services'));
      }, 10000);
    });
  },

  // Login com Google usando ID Token (sem redirect URIs)
  signIn: async () => {
    try {
      console.log('🚀 Iniciando login Google com ID Token...');
      
      return new Promise((resolve, reject) => {
        // Usar Google Sign-In direto (sem redirect)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          callback: async (response) => {
            console.log('📨 Resposta do Google ID Token:', response);
            
            if (response.error) {
              console.error('❌ Erro no Google Sign-In:', response.error);
              reject(new Error(response.error));
              return;
            }
            
            try {
              // Decodificar o ID Token para obter informações do usuário
              const payload = JSON.parse(atob(response.credential.split('.')[1]));
              console.log('👤 Payload do ID Token:', payload);
              
              // Salvar token
              localStorage.setItem('google_id_token', response.credential);
              localStorage.setItem('google_access_token', response.credential); // Para compatibilidade
              
              resolve({
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                imageUrl: payload.picture,
                idToken: response.credential,
                accessToken: response.credential
              });
              
            } catch (error) {
              console.error('❌ Erro ao processar ID Token:', error);
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false
        });
        
        // Renderizar o botão temporariamente e clicar automaticamente
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        
        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          type: 'standard'
        });
        
        // Simular clique no botão
        setTimeout(() => {
          const googleButton = tempDiv.querySelector('div[role="button"]');
          if (googleButton) {
            console.log('🔓 Simulando clique no botão Google...');
            googleButton.click();
          } else {
            // Fallback: usar prompt diretamente
            console.log('🔓 Usando prompt direto...');
            window.google.accounts.id.prompt((notification) => {
              console.log('📬 Notification:', notification);
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback para OAuth2 se o prompt não funcionar
                console.log('🔄 Fallback para OAuth2...');
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                  client_id: GOOGLE_CONFIG.CLIENT_ID,
                  scope: 'openid email profile',
                  callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                      reject(new Error(tokenResponse.error));
                      return;
                    }
                    
                    try {
                      // Buscar informações do usuário com access token
                      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                        headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                      });
                      
                      const userInfo = await userInfoResponse.json();
                      localStorage.setItem('google_access_token', tokenResponse.access_token);
                      
                      resolve({
                        id: userInfo.id,
                        name: userInfo.name,
                        email: userInfo.email,
                        imageUrl: userInfo.picture,
                        idToken: tokenResponse.access_token,
                        accessToken: tokenResponse.access_token
                      });
                    } catch (error) {
                      reject(error);
                    }
                  }
                });
                tokenClient.requestAccessToken({prompt: 'consent'});
              }
            });
          }
          
          // Limpar elemento temporário
          setTimeout(() => {
            document.body.removeChild(tempDiv);
          }, 1000);
        }, 100);
      });
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
      throw error;
    }
  },

  // Logout do Google
  signOut: async () => {
    try {
      // Revogar token
      const token = localStorage.getItem('google_access_token');
      if (token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST'
        });
        localStorage.removeItem('google_access_token');
      }
    } catch (error) {
      console.error('Erro no logout Google:', error);
      throw error;
    }
  },

  // Verificar se está logado
  isSignedIn: () => {
    return !!localStorage.getItem('google_access_token');
  }
};

// Google Calendar Helper Functions
export const googleCalendar = {
  // Inicializar Calendar API
  init: () => {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client', () => {
          window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.API_KEY,
            discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      } else {
        reject(new Error('Google API não carregada'));
      }
    });
  },

  // Listar eventos do calendário
  listEvents: async (calendarId = 'primary', timeMin = null, timeMax = null) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
        `timeMin=${timeMin || new Date().toISOString()}&` +
        `timeMax=${timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}&` +
        `singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar eventos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      throw error;
    }
  },

  // Criar evento no calendário
  createEvent: async (calendarId = 'primary', event) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao criar evento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  // Atualizar evento no calendário
  updateEvent: async (calendarId = 'primary', eventId, event) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar evento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  // Deletar evento do calendário
  deleteEvent: async (calendarId = 'primary', eventId) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }
};

// Real-time Google Calendar integration
export const realtimeCalendar = {
  // Authenticate with real-time sync
  authenticate: (accessToken) => {
    console.log('🔗 Autenticando com sincronização em tempo real...');
    realtimeSync.authenticate(accessToken);
  },

  // Create event with real-time sync
  createEvent: (eventData) => {
    console.log('📅 Criando evento em tempo real...', eventData);
    realtimeSync.createEvent(eventData);
  },

  // Update event with real-time sync
  updateEvent: (eventId, eventData) => {
    console.log('📝 Atualizando evento em tempo real...', eventId);
    realtimeSync.updateEvent(eventId, eventData);
  },

  // Delete event with real-time sync
  deleteEvent: (eventId) => {
    console.log('🗑️ Deletando evento em tempo real...', eventId);
    realtimeSync.deleteEvent(eventId);
  },

  // Sync calendar
  syncCalendar: () => {
    console.log('🔄 Sincronizando calendário em tempo real...');
    realtimeSync.syncCalendar();
  },

  // Add event listener for real-time updates
  onUpdate: (callback) => {
    realtimeSync.addListener(callback);
  },

  // Remove event listener
  offUpdate: (callback) => {
    realtimeSync.removeListener(callback);
  },

  // Get connection status
  getConnectionStatus: () => {
    return realtimeSync.getConnectionStatus();
  },

  // Get cached events
  getEvents: () => {
    return realtimeSync.getEvents();
  }
};
