import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentProfile, type ProfileRole } from '../context/AuthContext';

interface RouteProps {
  allowedRoles?: ProfileRole[];
}

const ProtectedRouteBase = ({ allowedRoles }: RouteProps) => {
  const { user, role, loading } = useCurrentProfile();

  const waitingForUser = loading && !user;
  const waitingForRole = loading && Boolean(allowedRoles?.length) && !role;

  if (waitingForUser || waitingForRole) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-secondary/70">Cargando acceso seguro...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export const ProtectedRoute = () => <ProtectedRouteBase />;

export const ProtectedTalentRoute = () => <ProtectedRouteBase allowedRoles={['talento']} />;

export const ProtectedCompanyRoute = () => <ProtectedRouteBase allowedRoles={['empresa']} />;
