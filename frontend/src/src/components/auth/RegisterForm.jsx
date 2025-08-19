import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://backend-clean-steel.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro bem-sucedido
        alert('Conta criada com sucesso! Faça login para continuar.');
        onSwitchToLogin();
      } else {
        setErrors({ general: data.error || 'Erro ao criar conta' });
      }
    } catch (error) {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
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
          <p className="text-blue-200">Crie sua conta para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                errors.name ? 'border-red-400 focus:ring-red-400' : ''
              }`}
              placeholder="Seu nome completo"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-300">{errors.name}</p>
            )}
          </div>

          {/* Email */}
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
              className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-400 focus:ring-red-400' : ''
              }`}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-300">{errors.email}</p>
            )}
          </div>

          {/* Senha */}
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
                className={`w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-blue-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-300">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-blue-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Botão de Registro */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Fazer Login
            </button>
          </p>
        </div>

        {/* Termos de Uso */}
        <div className="mt-6 text-center">
          <p className="text-xs text-blue-200/60">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Política de Privacidade</a>
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

export default RegisterForm;
