import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { ProtectedCompanyRoute, ProtectedTalentRoute } from './components/ProtectedRoute';
import CompanyCreate from './pages/CompanyCreate';
import CompanyEdit from './pages/CompanyEdit';
import CompanyPublic from './pages/CompanyPublic';
import Consultorias from './pages/Consultorias';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Inicio from './pages/Inicio';
import JobDetail from './pages/JobDetail';
import JobEdit from './pages/JobEdit';
import JobsDashboard from './pages/JobsDashboard';
import Login from './pages/Login';
import Publicar from './pages/Publicar';
import RegisterCompany from './pages/RegisterCompany';
import RegisterTalent from './pages/RegisterTalent';
import TalentApplications from './pages/TalentApplications';
import TalentProfile from './pages/TalentProfile';
import Talentos from './pages/Talentos';
import Vacancias from './pages/Vacancias';

const App = () => (
  <div className="min-h-screen bg-background text-text">
    <Navbar />
    <main className="pt-24">
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/vacancias" element={<Vacancias />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/talentos" element={<Talentos />} />
        <Route path="/consultorias" element={<Consultorias />} />
        <Route path="/empresa/:id" element={<CompanyPublic />} />
        <Route path="/vacancia/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-talent" element={<RegisterTalent />} />
        <Route path="/register-company" element={<RegisterCompany />} />

        <Route element={<ProtectedTalentRoute />}>
          <Route path="/mi-perfil" element={<TalentProfile />} />
          <Route path="/mis-postulaciones" element={<TalentApplications />} />
        </Route>

        <Route element={<ProtectedCompanyRoute />}>
          <Route path="/empresa/crear" element={<CompanyCreate />} />
          <Route path="/empresa/editar" element={<CompanyEdit />} />
          <Route path="/publicar" element={<Publicar />} />
          <Route path="/editar-vacancia/:id" element={<JobEdit />} />
          <Route path="/dashboard/mis-vacancias" element={<JobsDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
