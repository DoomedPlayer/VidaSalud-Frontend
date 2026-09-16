import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReceptionistPortal from './pages/ReceptionistPortal';
import PatientPortal from './pages/PatientPortal';
import Catalog from './pages/Catalog';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal(); 

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
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
                
                {/* AQUI SE ACTUALIZARON LOS ROLES A: Recepcionista y Paciente */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista', 'Paciente', 'Auditor']}><Dashboard /></ProtectedRoute>} />
                <Route path="/reception" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']}><ReceptionistPortal /></ProtectedRoute>} />
                <Route path="/patient-portal" element={<ProtectedRoute allowedRoles={['Paciente']}><PatientPortal /></ProtectedRoute>} />
                <Route path="/catalog" element={<ProtectedRoute allowedRoles={['Admin', 'Recepcionista']}><Catalog /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><Reports /></ProtectedRoute>} />
                <Route path="/audit" element={<ProtectedRoute allowedRoles={['Admin', 'Auditor']}><Audit /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </Router>
    );
}