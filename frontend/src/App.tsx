import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Public Citizen & Commuter Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { WhereIsMyBusPage } from './pages/WhereIsMyBusPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { ChargingStationsPage } from './pages/ChargingStationsPage';
import { ChargingDetailPage } from './pages/ChargingDetailPage';
import { CityPortalPage } from './pages/CityPortalPage';
import { HelpEmergencyPage } from './pages/HelpEmergencyPage';
import { NetworkPage } from './pages/NetworkPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AboutPage } from './pages/AboutPage';
import { SimulationPage } from './pages/SimulationPage';

// Operator & Admin Pages
import { LoginPage } from './pages/LoginPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <Layout>
            <Routes>
              {/* Public Platform Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/bus" element={<WhereIsMyBusPage />} />
              <Route path="/routes/:id" element={<RouteDetailPage />} />
              <Route path="/stops/:id" element={<StopDetailPage />} />
              <Route path="/charging" element={<ChargingStationsPage />} />
              <Route path="/charging/:id" element={<ChargingDetailPage />} />
              <Route path="/city" element={<CityPortalPage />} />
              <Route path="/help" element={<HelpEmergencyPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/simulation" element={<SimulationPage />} />

              {/* Operator Portal */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/charging/operator" element={<OperatorDashboardPage />} />

              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
