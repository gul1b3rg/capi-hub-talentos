import { useState } from 'react';
import { signInWithLinkedIn, linkLinkedInAccount } from '../lib/linkedInAuthService';

interface LinkedInButtonProps {
  mode: 'signin' | 'register' | 'link';
  onError?: (error: string) => void;
  className?: string;
}

const LinkedInButton = ({ mode, onError, className = '' }: LinkedInButtonProps) => {
  const [loading, setLoading] = useState(false);

  const labels = {
    signin: 'Ingresar con LinkedIn',
    register: 'Registrarse con LinkedIn',
    link: 'Importar desde LinkedIn',
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      if (mode === 'link') {
        await linkLinkedInAccount();
      } else {
        await signInWithLinkedIn();
      }
      // El redirect a LinkedIn sucede automáticamente
    } catch (error) {
      setLoading(false);
      const message = error instanceof Error ? error.message : 'Error al conectar con LinkedIn';
      if (onError) {
        onError(message);
      }
      // eslint-disable-next-line no-console
      console.error('[LinkedInButton] Error', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-3 rounded-2xl bg-[#0A66C2] px-6 py-3 font-semibold text-white transition hover:bg-[#004182] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {/* LinkedIn Logo SVG */}
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>

      {loading ? 'Conectando...' : labels[mode]}
    </button>
  );
};

export default LinkedInButton;
