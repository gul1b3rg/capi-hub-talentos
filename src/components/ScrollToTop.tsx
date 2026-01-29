import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que fuerza el scroll al tope de la página en cada cambio de ruta
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
