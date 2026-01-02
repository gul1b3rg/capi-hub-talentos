import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMiniBars3BottomRight } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import logo from '../assets/talentos-hub-logo.png';
import { navLinks } from '../data/content';
import { useCurrentProfile } from '../context/AuthContext';

const linkBase =
  'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-primary';

interface ActionLink {
  label: string;
  path: string;
  variant: 'ghost' | 'primary';
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, logout } = useCurrentProfile();

  // Filtrar navLinks basado en autenticación y rol
  const visibleNavLinks = useMemo(() => {
    if (!user) {
      // Usuario no autenticado: solo mostrar links públicos
      return navLinks.filter((link) => !['Publicar', 'Dashboard'].includes(link.label));
    }

    if (role === 'talento') {
      // Talentos: no mostrar Publicar ni Dashboard
      return navLinks.filter((link) => !['Publicar', 'Dashboard'].includes(link.label));
    }

    // Empresas: mostrar todos los links
    return navLinks;
  }, [user, role]);

  const actionLinks: ActionLink[] = useMemo(() => {
    if (!user || !role) {
      return [
        { label: 'Ingresar', path: '/login', variant: 'ghost' },
        { label: 'Registrarme', path: '/register-talent', variant: 'primary' },
      ];
    }

    if (role === 'empresa') {
      // Empresa: solo botón de Publicar (Dashboard ya está en navLinks)
      return [
        { label: 'Publicar vacancia', path: '/publicar', variant: 'primary' },
      ];
    }

    return [
      { label: 'Mi Perfil', path: '/mi-perfil', variant: 'ghost' },
      { label: 'Mis Postulaciones', path: '/mis-postulaciones', variant: 'primary' },
    ];
  }, [user, role]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('No se pudo cerrar sesión', error);
    }
  };

  const renderActionLink = (action: ActionLink, size: 'md' | 'mobile') => {
    const shared =
      action.variant === 'ghost'
        ? 'border border-primary/30 text-secondary hover:border-primary hover:text-primary'
        : 'bg-accent text-secondary shadow-[0_10px_25px_rgba(5,222,251,0.3)] hover:drop-shadow-neon';

    const sizeClasses = size === 'md' ? 'rounded-full px-4 py-2 text-sm font-semibold' : 'rounded-2xl px-4 py-3 font-semibold text-center';

    return (
      <Link key={action.path} to={action.path} onClick={() => setIsOpen(false)} className={`${shared} ${sizeClasses}`}>
        {action.label}
      </Link>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/inicio" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg">
            <img src={logo} alt="Hub CAPI logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">CAPI</p>
            <p className="font-display text-lg text-secondary">Hub</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/40 bg-white/60 px-1.5 py-1 md:flex">
          {visibleNavLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-secondary text-white shadow-md' : 'text-secondary/80'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {actionLinks.map((action) => renderActionLink(action, 'md'))}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-secondary/30 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-secondary"
            >
              Salir
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/60 text-secondary md:hidden"
          aria-label="Abrir menú"
        >
          {isOpen ? <IoClose className="text-2xl" /> : <HiMiniBars3BottomRight className="text-2xl" />}
        </button>

        {isOpen && (
          <div className="absolute inset-x-4 top-20 rounded-3xl border border-white/40 bg-white p-4 shadow-2xl md:hidden">
            <div className="flex flex-col gap-2">
              {visibleNavLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'bg-secondary text-white' : 'text-secondary/80'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              {actionLinks.map((action) => renderActionLink(action, 'mobile'))}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-secondary/40 px-4 py-3 text-center font-semibold text-secondary"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
