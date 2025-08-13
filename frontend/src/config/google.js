// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Google OAuth 2.0 Client ID
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // Você precisa criar no Google Cloud Console
  
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
  API_KEY: 'YOUR_GOOGLE_API_KEY' // Você precisa criar no Google Cloud Console
};

// Google OAuth Helper Functions
export const googleAuth = {
  // Inicializar Google API
  init: () => {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES
          }).then(resolve).catch(reject);
        });
      } else {
        reject(new Error('Google API não carregada'));
      }
    });
  },

  // Login com Google
  signIn: async () => {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        idToken: idToken
      };
    } catch (error) {
      console.error('Erro no login Google:', error);
      throw error;
    }
  },

  // Logout do Google
  signOut: async () => {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      await auth2.signOut();
    } catch (error) {
      console.error('Erro no logout Google:', error);
      throw error;
    }
  },

  // Verificar se está logado
  isSignedIn: () => {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      return auth2.isSignedIn.get();
    } catch (error) {
      return false;
    }
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
  listEvents: async (calendarId = 'primary', timeMin = new Date().toISOString()) => {
    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      throw error;
    }
  },

  // Criar evento no calendário
  createEvent: async (event, calendarId = 'primary') => {
    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: calendarId,
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  },

  // Atualizar evento no calendário
  updateEvent: async (eventId, event, calendarId = 'primary') => {
    try {
      const response = await window.gapi.client.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  },

  // Deletar evento do calendário
  deleteEvent: async (eventId, calendarId = 'primary') => {
    try {
      await window.gapi.client.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
      });

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }
};
