import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ProtectedRoute, ProtectedCompanyRoute, ProtectedTalentRoute } from './components/ProtectedRoute';
import { useCurrentProfile } from './context/AuthContext';

// Páginas críticas (eager loading) - Landing y autenticación
import Inicio from './pages/Inicio';
import Vacancias from './pages/Vacancias';
import Login from './pages/Login';
import RegisterTalent from './pages/RegisterTalent';
import RegisterCompany from './pages/RegisterCompany';

// Páginas secundarias (lazy loading)
const Empresas = lazy(() => import('./pages/Empresas'));
const Talentos = lazy(() => import('./pages/Talentos'));
const Consultorias = lazy(() => import('./pages/Consultorias'));
const Educacion = lazy(() => import('./pages/Educacion'));
const TerminosYCondiciones = lazy(() => import('./pages/TerminosYCondiciones'));
const PoliticaDePrivacidad = lazy(() => import('./pages/PoliticaDePrivacidad'));
const CompanyPublic = lazy(() => import('./pages/CompanyPublic'));
const TalentPublicProfile = lazy(() => import('./pages/TalentPublicProfile'));
const JobDetail = lazy(() => import('./pages/JobDetail'));

// Rutas protegidas - Talento (lazy loading)
const TalentProfile = lazy(() => import('./pages/TalentProfile'));
const TalentApplications = lazy(() => import('./pages/TalentApplications'));

// Rutas protegidas - Empresa (lazy loading)
const CompanyCreate = lazy(() => import('./pages/CompanyCreate'));
const CompanyEdit = lazy(() => import('./pages/CompanyEdit'));
const Publicar = lazy(() => import('./pages/Publicar'));
const JobEdit = lazy(() => import('./pages/JobEdit'));
const JobsDashboard = lazy(() => import('./pages/JobsDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CompanyApplications = lazy(() => import('./pages/CompanyApplications'));

// Componente de loading reutilizable
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="text-secondary/70">Cargando...</div>
  </div>
);

const App = () => {
  const { user, profile, role, loading } = useCurrentProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect incomplete LinkedIn OAuth profiles to profile editor
  useEffect(() => {
    // Skip if still loading or no user
    if (loading || !user) return;

    // Only redirect talentos with incomplete profiles
    if (role === 'talento' && profile) {
      const isIncomplete = !profile.headline || !profile.experience_years || !profile.area;
      const isOnProfilePage = location.pathname === '/mi-perfil';

      // If profile is incomplete and not already on profile page, redirect
      if (isIncomplete && !isOnProfilePage) {
        navigate('/mi-perfil', { replace: true });
      }
    }
  }, [user, profile, role, loading, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <ScrollToTop />

      {/* Spinner global durante loading (OAuth, fetch profile, etc) */}
      {/* Only show loading if we truly have no auth data */}
      <LoadingOverlay isLoading={loading && !profile} />

      <main className="pt-20">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            {/* Rutas públicas principales (eager) */}
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/vacancias" element={<Vacancias />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-talent" element={<RegisterTalent />} />
            <Route path="/register-company" element={<RegisterCompany />} />

          {/* Rutas públicas secundarias (lazy) */}
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/talentos" element={<Talentos />} />
          <Route path="/consultorias" element={<Consultorias />} />
          <Route path="/educacion" element={<Educacion />} />
          <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />
          <Route path="/politica-de-privacidad" element={<PoliticaDePrivacidad />} />
          <Route path="/vacancia/:id" element={<JobDetail />} />

          {/* Rutas protegidas - Requieren login (cualquier rol) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/talento/:id" element={<TalentPublicProfile />} />
            <Route path="/empresa/:id" element={<CompanyPublic />} />
          </Route>

          {/* Rutas protegidas - Talento */}
          <Route element={<ProtectedTalentRoute />}>
            <Route path="/mi-perfil" element={<TalentProfile />} />
            <Route path="/mis-postulaciones" element={<TalentApplications />} />
          </Route>

          {/* Rutas protegidas - Empresa */}
          <Route element={<ProtectedCompanyRoute />}>
            <Route path="/empresa/crear" element={<CompanyCreate />} />
            <Route path="/empresa/editar" element={<CompanyEdit />} />
            <Route path="/publicar" element={<Publicar />} />
            <Route path="/editar-vacancia/:id" element={<JobEdit />} />
            <Route path="/dashboard/mis-vacancias" element={<JobsDashboard />} />
            <Route path="/dashboard/postulaciones" element={<CompanyApplications />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
    <Footer />
    <Analytics />
  </div>
  );
};

export default App;
