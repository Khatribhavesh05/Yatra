import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { canAccess } from './utils/permissions';
import { ROUTES } from './utils/constants';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import LiveFleet from './pages/LiveFleet';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Alerts from './pages/Alerts';
import Charging from './pages/Charging';
import Users from './pages/Users';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import SystemHealth from './pages/SystemHealth';
import Profile from './pages/Profile';

import LoadingSpinner from './components/common/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-urja-bg">
        <LoadingSpinner message="Initializing command console..." size="md" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}

/**
 * Wraps a route element and checks the user's role against the route path.
 * If the user doesn't have access, redirects to the overview page.
 */
function RoleGuard({ route, children }: { route: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !canAccess(user.role, route)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/live-fleet" element={<LiveFleet />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/vehicles/:id" element={<VehicleDetail />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/charging" element={<Charging />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin-only routes */}
                <Route path="/departments" element={<RoleGuard route="/departments"><Departments /></RoleGuard>} />
                <Route path="/departments/:id" element={<RoleGuard route="/departments"><DepartmentDetail /></RoleGuard>} />
                <Route path="/users" element={<RoleGuard route="/users"><Users /></RoleGuard>} />
                <Route path="/devices" element={<RoleGuard route="/devices"><Devices /></RoleGuard>} />
                <Route path="/audit-logs" element={<RoleGuard route="/audit-logs"><AuditLogs /></RoleGuard>} />
                <Route path="/system-health" element={<RoleGuard route="/system-health"><SystemHealth /></RoleGuard>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
