import { type FormEvent, useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';

const SITE_PASSWORD = 'C4pi2023$';
const STORAGE_KEY = 'hub_access_granted';

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setAccessGranted(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setAccessGranted(true);
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <p className="text-secondary/70">Cargando...</p>
      </div>
    );
  }

  if (accessGranted) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <FaLock className="text-2xl text-secondary" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-semibold text-secondary">
            Acceso Restringido
          </h1>
          <p className="mt-2 text-center text-sm text-secondary/70">
            Este sitio está en construcción. Ingresa la contraseña para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-secondary">
              Contraseña
              <input
                type="password"
                className="mt-2 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ingresa la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:bg-secondary/90"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-secondary/50">
            Hub CAPI — Plataforma en desarrollo
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
