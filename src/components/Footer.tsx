import { FaInstagram, FaLinkedin } from "react-icons/fa";

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
          <p className="font-display text-lg">Hub de Talentos de Seguros</p>
          <p className="text-sm text-white/70">Powered by Cámara Paraguaya de Insurtech</p>
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
    <div className="border-t border-white/10 py-6 text-center text-xs text-white/70">
      Cámara Paraguaya de Insurtech · 2025 · Impulsando la innovación en seguros.
    </div>
  </footer>
);

export default Footer;
