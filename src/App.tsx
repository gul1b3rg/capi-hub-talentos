import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Consultorias from './pages/Consultorias';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Inicio from './pages/Inicio';
import Publicar from './pages/Publicar';
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
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/consultorias" element={<Consultorias />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
