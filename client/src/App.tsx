import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import OfficesPage from './pages/OfficesPage';
import LoginPage from './pages/LoginPage';
import SavedPage from './pages/SavedPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import EligibilityFormPage from './pages/EligibilityFormPage';
import EligibleSchemesPage from './pages/EligibleSchemesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailPage />} />
        <Route path="/offices" element={<OfficesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/saved"
          element={(
            <ProtectedRoute>
              <SavedPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/eligibility-form"
          element={(
            <ProtectedRoute>
              <EligibilityFormPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/eligible-schemes"
          element={(
            <ProtectedRoute>
              <EligibleSchemesPage />
            </ProtectedRoute>
          )}
        />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
    </Routes>
  );
}
