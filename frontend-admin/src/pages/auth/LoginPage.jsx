import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldAlert, Shield } from 'lucide-react';
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
  const logout = useAuthStore((s) => s.logout);

  // Si vienen redirigidos por "no eres admin"
  useEffect(() => {
    if (location.state?.error === 'no-admin') {
      toast.error('Solo el personal de la cafetería puede acceder al panel');
      logout();
    }
  }, [location.state, logout]);

  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: ({ data }) => {
      // Solo permitir entrada si es admin de cafetería
      if (!data.user?.is_cafeteria_admin) {
        toast.error('Tu cuenta no tiene permisos de administrador');
        return;
      }
      login({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });
      toast.success(`Bienvenido, ${data.user.first_name || data.user.username}`);
      navigate('/dashboard', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
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
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-coffee-800 rounded-full blur-3xl" />

        <Logo className="relative z-10 [&_span]:text-cream-100" />

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
            <Shield className="w-3.5 h-3.5 text-accent-light" />
            <span className="text-xs font-semibold text-accent-light uppercase tracking-wider">
              Acceso restringido
            </span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] mb-4 tracking-tight">
            Panel de
            <br />
            <span className="italic font-normal text-accent-light">administración</span>
          </h1>
          <p className="text-cream-200/80 text-base font-body leading-relaxed">
            Gestiona pedidos, productos y franjas horarias de la cafetería en tiempo real.
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

          <div className="md:hidden inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-dark" />
            <span className="text-xs font-semibold text-accent-dark uppercase tracking-wider">
              Solo personal autorizado
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-coffee-900 mb-2">
            Iniciar sesión
          </h2>
          <p className="text-coffee-600 text-sm mb-8">
            Acceso reservado al personal de la cafetería.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="admin"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full !py-3 !text-base mt-6"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar al panel'
              )}
            </button>
          </form>

        </motion.div>
      </main>
    </div>
  );
}
