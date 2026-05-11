import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/Logo';
import { getErrorMessage } from '@/api/client';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const from = location.state?.from?.pathname || '/';

  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: async ({ data }) => {
      login({ access: data.access, refresh: data.refresh, user: data.user });
      toast.success('¡Bienvenido!');
      navigate(from, { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const googleMutation = useMutation({
    mutationFn: (accessToken) => authApi.googleLogin(accessToken),
    onSuccess: async ({ data }) => {
      login({ access: data.access, refresh: data.refresh, user: data.user });
      toast.success('¡Bienvenido!');
      navigate(from, { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: ({ access_token }) => googleMutation.mutate(access_token),
    onError: () => toast.error('Error al iniciar sesión con Google'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Rellena todos los campos');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado izquierdo - branding */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-1 bg-coffee-900 text-cream-100 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Decoración */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-coffee-800 rounded-full blur-3xl" />

        <Logo className="relative z-10 [&_span]:text-cream-100 [&_span:last-child]:text-accent-light" />

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-tight mb-4 tracking-tight">
            Tu cafetería,
            <br />
            <span className="italic font-normal text-accent-light">sin colas.</span>
          </h1>
          <p className="text-cream-200/80 text-base font-body leading-relaxed">
            Pide desde tu sitio. Recoge cuando quieras. Aprovecha el recreo para lo importante.
          </p>
        </div>

        <p className="relative z-10 text-cream-200/40 text-xs">
          IES Pío Baroja · Madrid
        </p>
      </motion.aside>

      {/* Lado derecho - form */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <h2 className="font-display text-3xl font-bold text-coffee-900 mb-2">
            Iniciar sesión
          </h2>
          <p className="text-coffee-600 text-sm mb-8">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Regístrate
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
                Usuario o email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="alumno"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full mt-6"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-coffee-200" />
            <span className="text-xs text-coffee-500 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-coffee-200" />
          </div>

          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={googleMutation.isPending}
            className="btn-secondary w-full"
          >
            {googleMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <GoogleIcon />
            }
            Continuar con Google
          </button>

        </motion.div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a10.97 10.97 0 0 0 0 9.86l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
