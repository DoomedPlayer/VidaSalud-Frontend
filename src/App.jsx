import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

// Importamos todas tus páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionistPortal from './pages/ReceptionistPortal';
import PatientPortal from './pages/PatientPortal';
import Catalog from './pages/Catalog';
import Reports from './pages/Reports';
import Audit from './pages/Audit';

// Importamos nuestro Guardia
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal(); // Extraemos el estado de procesamiento de MSAL

    // LA MAGIA: Si MSAL está procesando la redirección, pausamos React Router
    if (inProgress !== 'none') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
                <h3 style={{ color: '#0f766e', fontFamily: 'sans-serif' }}>Procesando autenticación con Microsoft...</h3>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* RUTA PÚBLICA */}
                <Route 
                    path="/login" 
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
                />

                {/* RUTAS PRIVADAS (Protegidas por MSAL y Roles) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Operador', 'Cliente', 'Auditor']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/reception" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Operador']}>
                            <ReceptionistPortal />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/patient-portal" 
                    element={
                        <ProtectedRoute allowedRoles={['Cliente']}>
                            <PatientPortal />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/catalog" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Operador']}>
                            <Catalog />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/reports" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <Reports />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/audit" 
                    element={
                        <ProtectedRoute allowedRoles={['Admin', 'Auditor']}>
                            <Audit />
                        </ProtectedRoute>
                    } 
                />

                {/* RUTA POR DEFECTO (Fallback) */}
                <Route 
                    path="*" 
                    element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
                />
            </Routes>
        </Router>
    );
}