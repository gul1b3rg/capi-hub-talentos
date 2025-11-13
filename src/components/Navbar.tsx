import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMiniBars3BottomRight } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import logo from '../assets/talentos-hub-logo.png';
import { navLinks } from '../data/content';

const linkBase =
  'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-primary';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/inicio" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg">
            <img src={logo} alt="Talentos Hub logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">CAPI</p>
            <p className="font-display text-lg text-secondary">Talentos Hub</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/40 bg-white/60 px-1.5 py-1 md:flex">
          {navLinks.map((item) => (
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
          <Link
            to="/vacancias"
            className="rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
          >
            Explorar
          </Link>
          <Link
            to="/publicar"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-secondary shadow-[0_10px_25px_rgba(5,222,251,0.3)] hover:drop-shadow-neon"
          >
            Publicar vacancia
          </Link>
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
              {navLinks.map((item) => (
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
              <Link
                to="/vacancias"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-primary/30 px-4 py-3 text-center font-semibold text-secondary"
              >
                Explorar oportunidades
              </Link>
              <Link
                to="/publicar"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-accent px-4 py-3 text-center font-semibold text-secondary"
              >
                Publicar vacancia
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
