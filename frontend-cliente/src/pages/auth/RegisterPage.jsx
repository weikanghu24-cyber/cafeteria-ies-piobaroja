import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/Logo';
import { getErrorMessage } from '@/api/client';

export function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: '',
  });
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const registerMutation = useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: async ({ data }) => {
      login({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });
      toast.success('¡Cuenta creada! Bienvenido a la cafetería 🎉');
      navigate('/', { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password1 !== form.password2) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (form.password1.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    registerMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h2 className="font-display text-3xl font-bold text-coffee-900 mb-2 text-center">
          Crea tu cuenta
        </h2>
        <p className="text-coffee-600 text-sm mb-8 text-center">
          Pide tu desayuno antes del recreo y sáltate las colas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
                Nombre
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Lucia"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
                Apellido
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Garcia"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
              Usuario
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="input-field"
              placeholder="lucia.garcia"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="lucia@ies-piobaroja.es"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password1"
                value={form.password1}
                onChange={handleChange}
                className="input-field pr-12"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-500"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
              Repetir contraseña
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              name="password2"
              value={form.password2}
              onChange={handleChange}
              className="input-field"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="btn-primary w-full mt-6"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-coffee-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
