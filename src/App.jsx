// ======================================
// App.jsx - الملف الرئيسي للتطبيق
// ======================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContextWithSound';
import { SystemSettingsProvider } from './context/SystemSettingsContext';
import { DataProvider } from './context/DataContext';
import { TabProvider } from './contexts/TabContext';

// Components
import Layout from './components/Layout/Layout';
import Loading from './components/Common/Loading';
import Toast from './components/Common/Toast';

// Guards
import SubscriptionGuard from './middleware/SubscriptionGuard';

// Pages
import Login from './pages/Auth/Login';
import CompanySelectionPage from './pages/CompanySelectionPage';
import SubscriptionExpired from './pages/Subscription/SubscriptionExpired';

// مكون حماية المسارات - يتطلب اختيار شركة
const CompanyRoute = ({ children }) => {
  const { selectedCompany, isLoading } = useCompany();

  if (isLoading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (!selectedCompany) {
    return <Navigate to="/company-select" replace />;
  }

  return children;
};

// مكون حماية المسارات - يتطلب تسجيل دخول
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

// مكون مسار تسجيل الدخول
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// مكون مسار اختيار الشركة
const CompanySelectionRoute = ({ children }) => {
  const { selectedCompany, isLoading } = useCompany();

  if (isLoading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (selectedCompany) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <CompanyProvider>
        <SystemSettingsProvider>
          <AuthProvider>
            <NotificationProvider>
              <DataProvider>
                <TabProvider>
                {/* Toast Component - عرض الإشعارات المنبثقة */}
                <Toast />
              
                <Routes>
                  {/* مسار اختيار الشركة - العام */}
                  <Route
                    path="/company-select"
                    element={
                      <CompanySelectionRoute>
                        <CompanySelectionPage />
                      </CompanySelectionRoute>
                    }
                  />

                  {/* مسار صفحة انتهاء الاشتراك */}
                  <Route
                    path="/subscription-expired"
                    element={
                      <CompanyRoute>
                        <SubscriptionExpired />
                      </CompanyRoute>
                    }
                  />

                  {/* مسار تسجيل الدخول - يتطلب اختيار شركة واشتراك ساري */}
                  <Route
                    path="/login"
                    element={
                      <CompanyRoute>
                        <SubscriptionGuard>
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        </SubscriptionGuard>
                      </CompanyRoute>
                    }
                  />

                  {/* جميع المسارات المحمية - تتطلب اختيار شركة + اشتراك ساري + تسجيل دخول */}
                  <Route
                    path="/*"
                    element={
                      <CompanyRoute>
                        <SubscriptionGuard>
                          <ProtectedRoute />
                        </SubscriptionGuard>
                      </CompanyRoute>
                    }
                  />
                </Routes>
              </TabProvider>
            </DataProvider>
          </NotificationProvider>
        </AuthProvider>
      </SystemSettingsProvider>
    </CompanyProvider>
  </Router>
  );
}

export default App;
