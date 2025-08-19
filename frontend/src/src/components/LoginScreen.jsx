import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { googleAuth, GOOGLE_CONFIG } from '../config/google';

const LoginScreen = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Inicializar Google API quando o componente montar
  useEffect(() => {
    const initGoogle = async () => {
      try {
        await googleAuth.init();
        setGoogleInitialized(true);
        console.log('Google API inicializada com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar Google API:', error);
      }
    };

    // Aguardar o script do Google Identity Services carregar
    const checkGoogleAPI = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        clearInterval(checkGoogleAPI);
        initGoogle();
      }
    }, 100);
    
    // Timeout após 15 segundos
    setTimeout(() => {
      clearInterval(checkGoogleAPI);
      console.error('Timeout ao carregar Google Identity Services');
    }, 15000);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== FRONTEND LOGIN ATTEMPT ===');
      console.log('Form data:', formData);
      console.log('Making fetch request to Vercel backend...');
      
              const response = await fetch('https://backend-clean-steel.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response received:', response.status, response.statusText);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        console.log('Login failed:', data.error);
        alert(data.error || 'Erro no login');
      }
    } catch (error) {
      console.error('=== FRONTEND LOGIN ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleInitialized) {
      alert('Google API ainda não foi inicializada. Aguarde um momento.');
      return;
    }

    setIsGoogleLoading(true);
    
    try {
      // Fazer login com Google
      const googleUser = await googleAuth.signIn();
      
      // Salvar access token para uso posterior
      localStorage.setItem('google_access_token', googleUser.accessToken);
      
      // Enviar dados para o backend para autenticar
              const response = await fetch('https://backend-clean-steel.vercel.app/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: googleUser.idToken,
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        alert(data.error || 'Erro no login com Google');
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      alert('Erro ao conectar com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Planner Pro</h1>
          <p className="text-blue-200">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-blue-200">ou</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="mt-4 w-full bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">
            Não tem uma conta?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Registre-se
            </button>
          </p>
        </div>

        {/* Dados de teste */}
        <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-400/30">
          <p className="text-xs text-blue-200 text-center">
            <strong>Dados de teste:</strong><br />
            Email: teste@planner.com<br />
            Senha: 123456
          </p>
        </div>
      </div>

      <style jsx>{`
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
