import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from 'react-router-dom';

const capiLogo =
  'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=382,fit=crop/YD0l15PzbesbNaj0/logotipo-1-mxBrqn9JGlUE70lX.png';

const Footer = () => (
  <footer className="mt-20 bg-secondary text-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <a href="https://capi.com.py/" target="_blank" rel="noreferrer" className="inline-flex">
          <img src={capiLogo} alt="Logo CAPI" className="h-16 w-auto" />
        </a>
        <div>
          <p className="font-display text-lg">Hub de Seguros · CAPI</p>
          <p className="text-sm text-white/70">Iniciativa de la Cámara Paraguaya de Insurtech</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://www.instagram.com/insurtechpy/"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-xl text-white/80 transition hover:border-white hover:text-white"
          aria-label="Instagram CAPI"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.linkedin.com/company/insurtechpy"
          target="_blank"
          rel="noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-xl text-white/80 transition hover:border-white hover:text-white"
          aria-label="LinkedIn CAPI"
        >
          <FaLinkedin />
        </a>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
          <Link to="/terminos-y-condiciones" className="hover:text-white transition">
            Términos y Condiciones
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link to="/politica-de-privacidad" className="hover:text-white transition">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 py-6 text-center text-xs text-white/70">
      Cámara Paraguaya de Insurtech · 2026 · Impulsando la innovación en seguros.
    </div>
  </footer>
);

export default Footer;
